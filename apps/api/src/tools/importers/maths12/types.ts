export type ContentBlock =
  | { type: 'text'; value: string }
  | { type: 'math'; latex: string; display: boolean }
  | { type: 'table'; rows: ContentBlock[][][] };

export interface ParsedListItem {
  level: number;
  blocks: ContentBlock[];
}

export type SourceType = 'EXAMPLE' | 'EXERCISE' | 'MCQ_EXERCISE';

export interface ParsedQuestion {
  chapterNumber: number;
  sourceType: SourceType;
  sourceReference: string;
  sourceOrder: number;
  blocks: ContentBlock[];
  subItems: ParsedListItem[];
  isLikelyMcq: boolean;
  mcqOptions: ContentBlock[][] | null;
  mathObjectCount: number;
  tableCount: number;
  warnings: string[];
}

export interface ParsedChapter {
  chapterNumber: number;
  chapterTitle: string;
  sourceOrder: number;
  questions: ParsedQuestion[];
}

export interface ParagraphNode {
  styleId: string | null;
  numId: string | null;
  ilvl: number | null;
  text: string;
  blocks: ContentBlock[];
  isTable?: boolean;
  tableRows?: ContentBlock[][][];
  leadingBold: boolean;
}

export interface ImportAuditReport {
  sourceDocument: string;
  parsedAt: string;
  chaptersDetected: number;
  chaptersExpected: number;
  missingChapters: number[];
  perChapter: Array<{
    chapterNumber: number;
    chapterTitle: string;
    examples: number;
    exercises: number;
    mcqExercises: number;
    mcqLikely: number;
    mathObjects: number;
    tables: number;
  }>;
  totals: {
    questions: number;
    examples: number;
    exercises: number;
    mcqExercises: number;
    mcqLikely: number;
    mathObjects: number;
    mathObjectsConverted: number;
    mathObjectsFailed: number;
    tables: number;
  };
  parsingErrors: string[];
  ambiguousItems: string[];
  questionsMissingUsableText: string[];
}
