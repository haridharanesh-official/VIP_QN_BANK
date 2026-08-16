import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { PrismaClient } from '@prisma/client';
import { buildAuditReport, formatAuditSummary } from './audit';
import { loadDocumentXml, parseDocumentXml } from './document-parser';
import { segmentParagraphs } from './segmenter';
import { ParsedChapter } from './types';
import { importChapter, resolveTaxonomy } from './db-import';

const DEFAULT_SOURCE = path.resolve(__dirname, '../../../../../../data/imports/12 th Maths Question Bank 2026 Full Chapter.docx');
const REPORT_PATH = path.resolve(__dirname, '../../../../../../artifacts/imports/maths12-import-report.json');
const PARSED_SAMPLE_PATH = path.resolve(__dirname, '../../../../../../artifacts/imports/maths12-parsed-sample.json');

async function main() {
  const args = process.argv.slice(2);
  const sourceArgIdx = args.indexOf('--source');
  const source = sourceArgIdx >= 0 ? path.resolve(args[sourceArgIdx + 1]) : DEFAULT_SOURCE;
  const commit = args.includes('--commit');
  const chapterArgIdx = args.indexOf('--chapter');
  const chapterFilter = chapterArgIdx >= 0 ? Number(args[chapterArgIdx + 1]) : undefined;

  console.log(`Reading ${source}`);
  const xml = await loadDocumentXml(source);
  const parsed = parseDocumentXml(xml);
  const { chapters, ambiguousItems, questionsMissingUsableText } = segmentParagraphs(parsed.paragraphs);

  const report = buildAuditReport({
    sourceDocument: path.basename(source),
    chapters,
    mathObjectsTotal: parsed.mathObjectsTotal,
    mathObjectsConverted: parsed.mathObjectsConverted,
    mathObjectsFailed: parsed.mathObjectsFailed,
    parsingErrors: parsed.parsingErrors,
    ambiguousItems,
    questionsMissingUsableText,
  });

  console.log('');
  console.log(formatAuditSummary(report));

  await mkdir(path.dirname(REPORT_PATH), { recursive: true });
  await writeFile(REPORT_PATH, JSON.stringify(report, null, 2), 'utf8');
  console.log('');
  console.log(`Audit report written to ${REPORT_PATH}`);

  await writeFile(PARSED_SAMPLE_PATH, JSON.stringify(buildSample(chapters), null, 2), 'utf8');
  console.log(`Parsed sample (first 2 questions per chapter) written to ${PARSED_SAMPLE_PATH}`);

  if (report.totals.mathObjectsFailed > 0 || report.parsingErrors.length > 0) {
    console.error('');
    console.error('Dry run found parsing failures. Import must not proceed until these are resolved (see gate 3/4 policy).');
    process.exitCode = 1;
    return;
  }

  if (!commit) {
    console.log('');
    console.log('Dry run only. Pass --commit --chapter <n> to write one chapter to the database.');
    return;
  }

  if (!chapterFilter) {
    console.error('--commit requires --chapter <n> (import one chapter at a time; see gate policy).');
    process.exitCode = 1;
    return;
  }

  const chapter = chapters.find((c) => c.chapterNumber === chapterFilter);
  if (!chapter) {
    console.error(`Chapter ${chapterFilter} was not found in the parsed document.`);
    process.exitCode = 1;
    return;
  }

  const prisma = new PrismaClient();
  try {
    console.log('');
    console.log(`Resolving Standard 12 / Mathematics taxonomy...`);
    const taxonomy = await resolveTaxonomy(prisma);
    console.log(`Importing chapter ${chapter.chapterNumber} (${chapter.chapterTitle}): ${chapter.questions.length} questions...`);
    const result = await importChapter(prisma, taxonomy, chapter);
    console.log(`Chapter ${result.chapterNumber}: ${result.created} created, ${result.updated} updated, ${result.total} total.`);
  } finally {
    await prisma.$disconnect();
  }
}

function buildSample(chapters: ParsedChapter[]) {
  return chapters.map((c) => ({
    chapterNumber: c.chapterNumber,
    chapterTitle: c.chapterTitle,
    questionCount: c.questions.length,
    sampleQuestions: c.questions.slice(0, 2),
  }));
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
