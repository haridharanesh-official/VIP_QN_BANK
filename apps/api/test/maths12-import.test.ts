import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { loadDocumentXml, parseDocumentXml } from '../src/tools/importers/maths12/document-parser';
import { segmentParagraphs } from '../src/tools/importers/maths12/segmenter';
import { CANONICAL_CHAPTERS } from '../src/tools/importers/maths12/canonical-chapters';
import { ContentBlock } from '../src/tools/importers/maths12/types';

const SOURCE_PATH = path.resolve(__dirname, '../../../data/imports/12 th Maths Question Bank 2026 Full Chapter.docx');

// The source DOCX is a large licensed dataset and is intentionally gitignored (see .gitignore),
// so this integration test runs only in environments where it has been placed under
// data/imports/. Everywhere else it is skipped rather than failed, matching how the rest of the
// dataset-import pipeline treats the file as optional local input.
const sourceAvailable = existsSync(SOURCE_PATH);

test('maths12 import: full document parses with all 12 chapters and zero math failures', { skip: !sourceAvailable }, async () => {
  const xml = await loadDocumentXml(SOURCE_PATH);
  const parsed = parseDocumentXml(xml);
  assert.equal(parsed.parsingErrors.length, 0, `unexpected parsing errors: ${parsed.parsingErrors.join('; ')}`);
  assert.equal(parsed.mathObjectsFailed, 0, `${parsed.mathObjectsFailed} OMML nodes failed to convert`);
  assert.ok(parsed.mathObjectsTotal > 3000, 'expected several thousand math objects in the full question bank');

  const { chapters, ambiguousItems, questionsMissingUsableText } = segmentParagraphs(parsed.paragraphs);

  assert.equal(chapters.length, 12, 'expected exactly the 12 canonical chapters');
  assert.equal(questionsMissingUsableText.length, 0, `questions with no usable content: ${questionsMissingUsableText.join('; ')}`);

  for (const canonical of CANONICAL_CHAPTERS) {
    const chapter = chapters.find((c) => c.chapterNumber === canonical.number);
    assert.ok(chapter, `chapter ${canonical.number} not detected`);
    assert.equal(chapter!.chapterTitle, canonical.title);
    assert.ok(chapter!.questions.length > 10, `chapter ${canonical.number} has suspiciously few questions (${chapter!.questions.length})`);
  }

  // Regression: a shape-based heuristic ("3-5 short numbered sub-items => multiple choice") wrongly
  // tagged every multi-part textbook exercise as an MCQ — e.g. "Find the adjoint of the following:"
  // whose sub-items are question PARTS, not answer OPTIONS. Only the section context or explicit
  // in-question phrasing may establish multiple-choice, so an MCQ outside an MCQ_EXERCISE section
  // must actually say so in its own text.
  for (const chapter of chapters) {
    for (const question of chapter.questions) {
      if (!question.isLikelyMcq || question.sourceType === 'MCQ_EXERCISE') continue;
      const text = question.blocks
        .filter((b): b is Extract<ContentBlock, { type: 'text' }> => b.type === 'text')
        .map((b) => b.value)
        .join(' ');
      assert.match(
        text,
        /choose the correct|which of the following|the correct answer/i,
        `${question.sourceReference} (chapter ${chapter.chapterNumber}) was classified MCQ without MCQ section context or MCQ phrasing`,
      );
    }
  }

  // Any unmapped Unicode symbol surviving into LaTeX (e.g. an un-substituted operator glyph)
  // would fail to compile; the unit-level regression fixture in maths12-omml-converter.test.ts
  // additionally guards against the specific \left -> \lef t control-word-gluing bug.
  const nonAscii = /[^\x00-\x7F]/;
  let checked = 0;

  function scanBlocks(blocks: ContentBlock[], context: string): void {
    for (const block of blocks) {
      if (block.type === 'math') {
        checked += 1;
        assert.ok(block.latex.trim().length > 0, `empty LaTeX in ${context}`);
        assert.doesNotMatch(block.latex, nonAscii, `unmapped Unicode symbol survived in ${context}: ${block.latex}`);
      } else if (block.type === 'table') {
        for (const row of block.rows) for (const cell of row) scanBlocks(cell, context);
      }
    }
  }

  for (const chapter of chapters) {
    for (const question of chapter.questions) {
      const context = `${question.sourceReference} (chapter ${chapter.chapterNumber})`;
      scanBlocks(question.blocks, context);
      for (const subItem of question.subItems) scanBlocks(subItem.blocks, context);
    }
  }
  assert.equal(checked, parsed.mathObjectsTotal, 'every parsed math object should be reachable from a question or its sub-items');

  assert.ok(ambiguousItems.length < 10, `unexpectedly many ambiguous segmentation items: ${ambiguousItems.join('; ')}`);
});
