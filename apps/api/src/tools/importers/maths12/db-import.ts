import { PrismaClient, Prisma, OwnershipScope, QuestionType, ReviewStatus } from '@prisma/client';
import { toJson } from '../../../common/json';
import { CANONICAL_CHAPTERS } from './canonical-chapters';
import { ParsedChapter, ParsedQuestion } from './types';

const SOURCE_DOCUMENT = '12_TH_MATHS_QB_2026';

export interface TaxonomyContext {
  readonly boardId: string;
  readonly syllabusVersionId: string;
  readonly mediumId: string;
  readonly standardId: string;
  readonly subjectId: string;
  readonly createdByUserId: string;
}

/**
 * Resolves (creating if absent) the Standard 12 / Mathematics taxonomy row and all 12 canonical
 * chapters underneath it, reusing the existing Tamil Nadu State Board / 2026-27 syllabus version
 * and English medium that the 10th-standard dev seed already established — per the import spec,
 * board/syllabus must be reused when the existing DB already establishes the correct one, not
 * guessed or duplicated.
 */
export async function resolveTaxonomy(prisma: PrismaClient): Promise<TaxonomyContext> {
  const board = await prisma.board.findUniqueOrThrow({ where: { code: 'TN_STATE' } });
  const syllabus = await prisma.syllabusVersion.findUniqueOrThrow({ where: { boardId_code: { boardId: board.id, code: '2026-27' } } });
  const medium = await prisma.medium.findUniqueOrThrow({ where: { code: 'EN' } });
  const owner = await prisma.user.findUniqueOrThrow({ where: { email: 'owner@vip-maths.local' } });

  const standard = await prisma.standard.upsert({
    where: { syllabusVersionId_code: { syllabusVersionId: syllabus.id, code: '12' } },
    update: {},
    create: { syllabusVersionId: syllabus.id, code: '12', name: 'Class 12', sortOrder: 12 },
  });

  const subject = await prisma.subject.upsert({
    where: { standardId_mediumId_code: { standardId: standard.id, mediumId: medium.id, code: 'MATH12' } },
    update: {},
    create: { standardId: standard.id, mediumId: medium.id, code: 'MATH12', name: 'Mathematics', slug: 'mathematics', sortOrder: 1 },
  });

  for (const canonical of CANONICAL_CHAPTERS) {
    await prisma.chapter.upsert({
      where: { subjectId_code: { subjectId: subject.id, code: `MATH12-CH${String(canonical.number).padStart(2, '0')}` } },
      update: { name: canonical.title },
      create: {
        subjectId: subject.id,
        code: `MATH12-CH${String(canonical.number).padStart(2, '0')}`,
        name: canonical.title,
        slug: canonical.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
        sortOrder: canonical.number,
      },
    });
  }

  return { boardId: board.id, syllabusVersionId: syllabus.id, mediumId: medium.id, standardId: standard.id, subjectId: subject.id, createdByUserId: owner.id };
}

export interface ImportChapterResult {
  readonly chapterNumber: number;
  readonly created: number;
  readonly updated: number;
  readonly total: number;
}

/**
 * Imports every question of one chapter idempotently: (chapterId, sourceOrder) is the stable
 * identity, enforced by a unique index, so re-running this for the same chapter never duplicates
 * rows — `createMany({ skipDuplicates: true })` silently no-ops on rows that already exist. This
 * intentionally does one bulk insert rather than one create/update pair per question: the pooled
 * Supabase connection this CLI runs against drops sessions that hold too many sequential
 * round-trips open (observed as Prisma error P1017, "server has closed the connection", partway
 * through a 103-question chapter using the naive per-row approach), so minimizing round-trips is
 * a reliability requirement here, not just a performance nicety.
 *
 * Math-rich content is stored as questionTextFormat="RICH_BLOCKS_V1" with questionText holding the
 * serialized block array (text/math/table blocks in original document order) — reusing the
 * existing column pair rather than adding a new one.
 *
 * marks/difficulty/bloomLevel/correctAnswer are intentionally left null: this dataset has no
 * reliable source for exam marks or Bloom classification, and answer enrichment is a separate,
 * not-yet-started gate. reviewStatus is APPROVED because the *question content* has already been
 * verified by the Gate 1 equation round-trip audit (0 conversion failures across the whole
 * chapter) — that is a distinct concern from *answer* verification, which the schema has no field
 * for yet and must not be faked.
 */
export async function importChapter(prisma: PrismaClient, taxonomy: TaxonomyContext, chapter: ParsedChapter): Promise<ImportChapterResult> {
  const chapterRow = await prisma.chapter.findUniqueOrThrow({
    where: { subjectId_code: { subjectId: taxonomy.subjectId, code: `MATH12-CH${String(chapter.chapterNumber).padStart(2, '0')}` } },
  });

  const rows = chapter.questions.map((question) => ({
    ...questionRowData(question, taxonomy, chapterRow.id),
    ownershipScope: 'GLOBAL' satisfies OwnershipScope as OwnershipScope,
    createdByUserId: taxonomy.createdByUserId,
  }));

  const created = (await prisma.question.createMany({ data: rows, skipDuplicates: true })).count;

  // Re-running the importer after a parser fix must correct rows already in the database, not just
  // skip them — otherwise a classification bug stays frozen in whatever was imported first. Only
  // rows whose derived content actually differs are written back, so a no-change re-run costs one
  // read and no writes.
  const existing = await prisma.question.findMany({
    where: { chapterId: chapterRow.id, sourceDocument: SOURCE_DOCUMENT },
    select: { id: true, sourceOrder: true, questionType: true, questionText: true, sourceType: true, sourceReference: true, options: true },
  });
  const bySourceOrder = new Map(existing.map((row) => [row.sourceOrder, row]));

  let updated = 0;
  for (const row of rows) {
    const current = bySourceOrder.get(row.sourceOrder);
    if (!current) continue;
    const optionsChanged = JSON.stringify(current.options ?? null) !== JSON.stringify(row.options === Prisma.JsonNull ? null : row.options);
    if (
      current.questionType === row.questionType &&
      current.questionText === row.questionText &&
      current.sourceType === row.sourceType &&
      current.sourceReference === row.sourceReference &&
      !optionsChanged
    ) {
      continue;
    }
    await prisma.question.update({
      where: { id: current.id },
      data: { questionType: row.questionType, questionText: row.questionText, sourceType: row.sourceType, sourceReference: row.sourceReference, options: row.options },
    });
    updated += 1;
  }

  return { chapterNumber: chapter.chapterNumber, created, updated, total: chapter.questions.length };
}

function questionRowData(question: ParsedQuestion, taxonomy: TaxonomyContext, chapterId: string) {
  return {
    boardId: taxonomy.boardId,
    syllabusVersionId: taxonomy.syllabusVersionId,
    mediumId: taxonomy.mediumId,
    standardId: taxonomy.standardId,
    subjectId: taxonomy.subjectId,
    chapterId,
    questionType: (question.isLikelyMcq ? 'MCQ_SINGLE' : 'DESCRIPTIVE') satisfies QuestionType as QuestionType,
    marks: null,
    difficulty: null,
    bloomLevel: null,
    // RICH_BLOCKS_V1 stores the ordered text/math/table block array as serialized JSON text in the
    // existing question_text column (see types.ts ContentBlock) rather than adding a schema column.
    questionText: JSON.stringify(question.blocks),
    questionTextFormat: 'RICH_BLOCKS_V1',
    correctAnswer: Prisma.JsonNull,
    options: question.mcqOptions ? toJson(question.mcqOptions) : Prisma.JsonNull,
    sourceType: question.sourceType,
    sourceReference: question.sourceReference,
    sourceDocument: SOURCE_DOCUMENT,
    sourceOrder: question.sourceOrder,
    reviewStatus: 'APPROVED' satisfies ReviewStatus as ReviewStatus,
  };
}
