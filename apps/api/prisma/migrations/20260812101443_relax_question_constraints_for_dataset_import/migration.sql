-- AlterEnum
ALTER TYPE "QuestionType" ADD VALUE 'DESCRIPTIVE';

-- AlterTable
ALTER TABLE "questions" ADD COLUMN     "source_document" TEXT,
ADD COLUMN     "source_order" INTEGER,
ALTER COLUMN "marks" DROP NOT NULL,
ALTER COLUMN "difficulty" DROP NOT NULL,
ALTER COLUMN "bloom_level" DROP NOT NULL,
ALTER COLUMN "correct_answer" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "questions_chapter_id_source_order_key" ON "questions"("chapter_id", "source_order");
