import { CANONICAL_CHAPTERS } from './canonical-chapters';
import { chapterSummary } from './segmenter';
import { ImportAuditReport, ParsedChapter } from './types';

export interface BuildAuditInput {
  sourceDocument: string;
  chapters: ParsedChapter[];
  mathObjectsTotal: number;
  mathObjectsConverted: number;
  mathObjectsFailed: number;
  parsingErrors: string[];
  ambiguousItems: string[];
  questionsMissingUsableText: string[];
}

export function buildAuditReport(input: BuildAuditInput): ImportAuditReport {
  const perChapter = chapterSummary(input.chapters);
  const detectedNumbers = new Set(input.chapters.map((c) => c.chapterNumber));
  const missingChapters = CANONICAL_CHAPTERS.map((c) => c.number).filter((n) => !detectedNumbers.has(n));

  const totals = perChapter.reduce(
    (acc, c) => {
      acc.examples += c.examples;
      acc.exercises += c.exercises;
      acc.mcqExercises += c.mcqExercises;
      acc.mcqLikely += c.mcqLikely;
      acc.tables += c.tables;
      return acc;
    },
    { examples: 0, exercises: 0, mcqExercises: 0, mcqLikely: 0, tables: 0 },
  );

  return {
    sourceDocument: input.sourceDocument,
    parsedAt: new Date().toISOString(),
    chaptersDetected: input.chapters.length,
    chaptersExpected: CANONICAL_CHAPTERS.length,
    missingChapters,
    perChapter,
    totals: {
      questions: totals.examples + totals.exercises + totals.mcqExercises,
      examples: totals.examples,
      exercises: totals.exercises,
      mcqExercises: totals.mcqExercises,
      mcqLikely: totals.mcqLikely,
      mathObjects: input.mathObjectsTotal,
      mathObjectsConverted: input.mathObjectsConverted,
      mathObjectsFailed: input.mathObjectsFailed,
      tables: totals.tables,
    },
    parsingErrors: input.parsingErrors,
    ambiguousItems: input.ambiguousItems,
    questionsMissingUsableText: input.questionsMissingUsableText,
  };
}

export function formatAuditSummary(report: ImportAuditReport): string {
  const lines: string[] = [];
  lines.push('VIP MATHS — 12TH DATASET IMPORT AUDIT');
  lines.push('');
  lines.push(`Source: ${report.sourceDocument}`);
  lines.push(`Chapters detected: ${report.chaptersDetected} / ${report.chaptersExpected}`);
  if (report.missingChapters.length > 0) {
    lines.push(`Missing chapters: ${report.missingChapters.join(', ')}`);
  }
  lines.push('');
  lines.push('Per-chapter breakdown:');
  for (const c of report.perChapter) {
    lines.push(
      `  ${String(c.chapterNumber).padStart(2, ' ')}. ${c.chapterTitle} — examples:${c.examples} exercises:${c.exercises} mcqExercises:${c.mcqExercises} mcqLikely:${c.mcqLikely} math:${c.mathObjects} tables:${c.tables}`,
    );
  }
  lines.push('');
  lines.push(
    `Total questions: ${report.totals.questions} (examples ${report.totals.examples}, exercises ${report.totals.exercises}, mcq exercises ${report.totals.mcqExercises})`,
  );
  lines.push(`MCQ (likely, any source type): ${report.totals.mcqLikely}`);
  lines.push(`Math objects: ${report.totals.mathObjects} detected, ${report.totals.mathObjectsConverted} converted, ${report.totals.mathObjectsFailed} failed`);
  lines.push(`Tables: ${report.totals.tables}`);
  lines.push(`Parsing errors: ${report.parsingErrors.length}`);
  lines.push(`Ambiguous items: ${report.ambiguousItems.length}`);
  lines.push(`Questions missing usable text: ${report.questionsMissingUsableText.length}`);
  return lines.join('\n');
}
