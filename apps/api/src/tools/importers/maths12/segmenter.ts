import { CANONICAL_CHAPTERS, normalizeTitle } from './canonical-chapters';
import { ContentBlock, ParagraphNode, ParsedChapter, ParsedListItem, ParsedQuestion, SourceType } from './types';

const CHAPTER_HEADING_RE = /^chapter[\s-]*(\d+)\s*[:.\-]?\s*(.*)$/i;
const EXAMPLE_LEAD_RE = /^example\s+(\d+)\.(\d+)/i;
const EXERCISE_HEADING_RE = /^exercise\s+(\d+)\.(\d+)/i;
const MCQ_HINT_RE = /choose the correct|which of the following|the correct answer/i;

interface SegmentResult {
  chapters: ParsedChapter[];
  ambiguousItems: string[];
  questionsMissingUsableText: string[];
}

export function segmentParagraphs(paragraphs: ParagraphNode[]): SegmentResult {
  const chapters: ParsedChapter[] = [];
  const ambiguousItems: string[] = [];
  const questionsMissingUsableText: string[] = [];

  let currentChapter: ParsedChapter | null = null;
  let currentSourceType: SourceType | null = null;
  let currentExerciseRef: string | null = null;
  let currentQuestion: ParsedQuestion | null = null;
  let chapterSourceOrder = 0;
  let questionSourceOrder = 0;

  const closeQuestion = () => {
    if (currentQuestion && currentChapter) {
      finalizeQuestion(currentQuestion, questionsMissingUsableText);
      currentChapter.questions.push(currentQuestion);
    }
    currentQuestion = null;
  };

  for (const para of paragraphs) {
    if (para.isTable) {
      if (currentQuestion) {
        currentQuestion.blocks.push({ type: 'table', rows: para.tableRows ?? [] });
        currentQuestion.tableCount += 1;
      }
      continue;
    }

    if (para.styleId === 'Heading1') {
      const headingText = para.text.trim();
      const chapterMatch = headingText.match(CHAPTER_HEADING_RE);
      if (chapterMatch) {
        closeQuestion();
        const number = Number(chapterMatch[1]);
        const rawTitle = chapterMatch[2].trim();
        const title = matchCanonicalTitle(rawTitle, number, ambiguousItems);
        currentChapter = { chapterNumber: number, chapterTitle: title, sourceOrder: chapterSourceOrder++, questions: [] };
        chapters.push(currentChapter);
        currentSourceType = null;
        currentExerciseRef = null;
        questionSourceOrder = 0;
        continue;
      }
      if (/^examples$/i.test(headingText)) {
        closeQuestion();
        currentSourceType = 'EXAMPLE';
        currentExerciseRef = null;
        continue;
      }
      const exerciseMatch = headingText.match(EXERCISE_HEADING_RE);
      if (exerciseMatch) {
        closeQuestion();
        currentSourceType = 'EXERCISE';
        currentExerciseRef = `Exercise ${exerciseMatch[1]}.${exerciseMatch[2]}`;
        continue;
      }
      // Unrecognized Heading1 text (e.g. a differently worded MCQ section banner).
      closeQuestion();
      ambiguousItems.push(`Unrecognized Heading1 "${headingText}" (chapter ${currentChapter?.chapterNumber ?? '?'})`);
      currentSourceType = /mcq|multiple\s*choice/i.test(headingText) ? 'MCQ_EXERCISE' : currentSourceType;
      continue;
    }

    if (!currentChapter || !currentSourceType) {
      // Front matter / table of contents before the first chapter heading.
      continue;
    }

    if (currentSourceType === 'EXAMPLE') {
      const exampleMatch = para.leadingBold ? para.text.match(EXAMPLE_LEAD_RE) : null;
      if (exampleMatch) {
        closeQuestion();
        currentQuestion = newQuestion(currentChapter.chapterNumber, 'EXAMPLE', `Example ${exampleMatch[1]}.${exampleMatch[2]}`, questionSourceOrder++);
      }
      if (!currentQuestion) continue;
      appendParagraph(currentQuestion, para, ambiguousItems);
      continue;
    }

    if (currentSourceType === 'EXERCISE' || currentSourceType === 'MCQ_EXERCISE') {
      if (para.numId && para.ilvl === 0) {
        closeQuestion();
        const ref = currentExerciseRef ?? `Exercise (unlabeled, chapter ${currentChapter.chapterNumber})`;
        currentQuestion = newQuestion(currentChapter.chapterNumber, currentSourceType, ref, questionSourceOrder++);
        appendParagraph(currentQuestion, para, ambiguousItems, true);
        continue;
      }
      if (para.numId && (para.ilvl ?? 0) >= 1 && currentQuestion) {
        currentQuestion.subItems.push({ level: para.ilvl ?? 1, blocks: para.blocks });
        continue;
      }
      if (currentQuestion) {
        appendParagraph(currentQuestion, para, ambiguousItems);
      } else if (para.text.trim().length > 0) {
        if (MCQ_HINT_RE.test(para.text)) {
          // Confident signal: the exercise's own intro line says this is an MCQ block
          // ("Choose the correct or the most suitable answer ..."), so reclassify it
          // instead of leaving every question in it under generic EXERCISE.
          currentSourceType = 'MCQ_EXERCISE';
        } else {
          ambiguousItems.push(`Text before first numbered question in ${currentExerciseRef ?? 'exercise'} (chapter ${currentChapter.chapterNumber}): "${para.text.slice(0, 60)}"`);
        }
      }
      continue;
    }
  }
  closeQuestion();

  return { chapters, ambiguousItems, questionsMissingUsableText };
}

function newQuestion(chapterNumber: number, sourceType: SourceType, sourceReference: string, sourceOrder: number): ParsedQuestion {
  return {
    chapterNumber,
    sourceType,
    sourceReference,
    sourceOrder,
    blocks: [],
    subItems: [],
    isLikelyMcq: false,
    mcqOptions: null,
    mathObjectCount: 0,
    tableCount: 0,
    warnings: [],
  };
}

function appendParagraph(question: ParsedQuestion, para: ParagraphNode, ambiguousItems: string[], isFirst = false): void {
  let blocks = para.blocks;
  if (isFirst) {
    // Strip the leading numbering/label text is unnecessary (numPr numbers aren't in the XML text),
    // but drop a bold "Example n.n" lead run duplicated as plain text for examples.
    blocks = para.blocks;
  }
  question.blocks.push(...blocks);
  for (const block of blocks) {
    if (block.type === 'math') question.mathObjectCount += 1;
    if (block.type === 'table') question.tableCount += 1;
  }
}

function finalizeQuestion(question: ParsedQuestion, questionsMissingUsableText: string[]): void {
  const hasText = question.blocks.some((b) => b.type === 'text' && b.value.trim().length > 0);
  const hasMath = question.mathObjectCount > 0;
  const hasTable = question.tableCount > 0;
  if (!hasText && !hasMath && !hasTable) {
    question.warnings.push('No usable text, math or table content extracted');
    questionsMissingUsableText.push(`${question.sourceReference} (chapter ${question.chapterNumber}, source order ${question.sourceOrder})`);
  }

  // Only the section context ("Choose the correct or the most suitable answer...") or explicit
  // in-question phrasing may establish that something is multiple-choice. Sub-item *shape* must
  // never imply it: a textbook exercise like "Find the adjoint of the following:" carries 3-5
  // short numbered sub-items that are question PARTS, not answer OPTIONS, and an earlier
  // shape-based heuristic misclassified every such exercise in chapter 1 as an MCQ.
  question.isLikelyMcq = question.sourceType === 'MCQ_EXERCISE' || MCQ_HINT_RE.test(blocksToPlainText(question.blocks));

  if (question.isLikelyMcq && question.subItems.length >= 2) {
    question.mcqOptions = question.subItems.map((item) => item.blocks);
  }
}

function blocksToPlainText(blocks: ContentBlock[]): string {
  return blocks
    .filter((b): b is Extract<ContentBlock, { type: 'text' }> => b.type === 'text')
    .map((b) => b.value)
    .join(' ')
    .trim();
}

function matchCanonicalTitle(rawTitle: string, number: number, ambiguousItems: string[]): string {
  const canonical = CANONICAL_CHAPTERS.find((c) => c.number === number);
  if (!canonical) {
    ambiguousItems.push(`Chapter number ${number} has no canonical entry (source title: "${rawTitle}")`);
    return rawTitle || `Chapter ${number}`;
  }
  const normalizedRaw = normalizeTitle(rawTitle);
  const normalizedCanonical = normalizeTitle(canonical.title);
  if (normalizedRaw !== normalizedCanonical && !normalizedCanonical.includes(normalizedRaw) && !normalizedRaw.includes(normalizedCanonical)) {
    ambiguousItems.push(`Chapter ${number} source title "${rawTitle}" does not closely match canonical "${canonical.title}"`);
  }
  return canonical.title;
}

export function chapterSummary(chapters: ParsedChapter[]) {
  return chapters.map((c) => ({
    chapterNumber: c.chapterNumber,
    chapterTitle: c.chapterTitle,
    examples: c.questions.filter((q) => q.sourceType === 'EXAMPLE').length,
    exercises: c.questions.filter((q) => q.sourceType === 'EXERCISE').length,
    mcqExercises: c.questions.filter((q) => q.sourceType === 'MCQ_EXERCISE').length,
    mcqLikely: c.questions.filter((q) => q.isLikelyMcq).length,
    mathObjects: c.questions.reduce((sum, q) => sum + q.mathObjectCount, 0),
    tables: c.questions.reduce((sum, q) => sum + q.tableCount, 0),
  }));
}
