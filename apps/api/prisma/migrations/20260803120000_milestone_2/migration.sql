-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'INVITED');

-- CreateEnum
CREATE TYPE "InstitutionType" AS ENUM ('SCHOOL', 'TUITION_CENTRE', 'INDIVIDUAL', 'COLLEGE', 'OTHER');

-- CreateEnum
CREATE TYPE "InstitutionStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "MemberRole" AS ENUM ('OWNER', 'ADMIN', 'HOD', 'TEACHER', 'CONTENT_REVIEWER');

-- CreateEnum
CREATE TYPE "MemberStatus" AS ENUM ('ACTIVE', 'INVITED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "OwnershipScope" AS ENUM ('GLOBAL', 'INSTITUTION', 'PRIVATE');

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('MCQ_SINGLE', 'MCQ_MULTIPLE', 'TRUE_FALSE', 'FILL_IN_BLANK', 'ONE_WORD', 'ASSERTION_REASON', 'CASE_STUDY', 'NUMERICAL', 'VERY_SHORT_ANSWER', 'SHORT_ANSWER', 'LONG_ANSWER', 'ESSAY');

-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- CreateEnum
CREATE TYPE "BloomLevel" AS ENUM ('REMEMBER', 'UNDERSTAND', 'APPLY', 'ANALYZE', 'EVALUATE', 'CREATE');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'APPROVED', 'CHANGES_REQUESTED', 'REJECTED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ReviewDecision" AS ENUM ('APPROVED', 'CHANGES_REQUESTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "BlueprintStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "PaperStatus" AS ENUM ('DRAFT', 'GENERATED', 'APPROVED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "GenerationMode" AS ENUM ('MANUAL', 'AUTOMATIC', 'BLUEPRINT', 'CHAPTER_WISE', 'FULL_SYLLABUS');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "password_hash" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "email_verified_at" TIMESTAMP(3),
    "phone_verified_at" TIMESTAMP(3),
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "token_hash" TEXT NOT NULL,
    "family_id" UUID NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),
    "replaced_by_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "institutions" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "institution_type" "InstitutionType" NOT NULL,
    "board_affiliation" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT NOT NULL DEFAULT 'India',
    "postal_code" TEXT,
    "logo_object_key" TEXT,
    "status" "InstitutionStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_by_user_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "institutions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "institution_members" (
    "id" UUID NOT NULL,
    "institution_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "role" "MemberRole" NOT NULL,
    "status" "MemberStatus" NOT NULL DEFAULT 'ACTIVE',
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "institution_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "boards" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "boards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "syllabus_versions" (
    "id" UUID NOT NULL,
    "board_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "academic_year" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "syllabus_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mediums" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "mediums_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "standards" (
    "id" UUID NOT NULL,
    "syllabus_version_id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL,

    CONSTRAINT "standards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subjects" (
    "id" UUID NOT NULL,
    "standard_id" UUID NOT NULL,
    "medium_id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "subjects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chapters" (
    "id" UUID NOT NULL,
    "subject_id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL,

    CONSTRAINT "chapters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "topics" (
    "id" UUID NOT NULL,
    "chapter_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "topics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "questions" (
    "id" UUID NOT NULL,
    "institution_id" UUID,
    "ownership_scope" "OwnershipScope" NOT NULL,
    "board_id" UUID NOT NULL,
    "syllabus_version_id" UUID NOT NULL,
    "medium_id" UUID NOT NULL,
    "standard_id" UUID NOT NULL,
    "subject_id" UUID NOT NULL,
    "chapter_id" UUID NOT NULL,
    "topic_id" UUID,
    "question_type" "QuestionType" NOT NULL,
    "marks" INTEGER NOT NULL,
    "difficulty" "Difficulty" NOT NULL,
    "bloom_level" "BloomLevel" NOT NULL,
    "question_text" TEXT NOT NULL,
    "question_text_format" TEXT NOT NULL DEFAULT 'PLAIN_TEXT',
    "correct_answer" JSONB NOT NULL,
    "alternative_answers" JSONB,
    "solution" TEXT,
    "explanation" TEXT,
    "hint" TEXT,
    "marking_scheme" JSONB,
    "options" JSONB,
    "source_type" TEXT NOT NULL,
    "source_reference" TEXT,
    "is_book_back" BOOLEAN NOT NULL DEFAULT false,
    "is_creative" BOOLEAN NOT NULL DEFAULT false,
    "is_previous_year" BOOLEAN NOT NULL DEFAULT false,
    "is_pta" BOOLEAN NOT NULL DEFAULT false,
    "is_hots" BOOLEAN NOT NULL DEFAULT false,
    "is_case_study" BOOLEAN NOT NULL DEFAULT false,
    "review_status" "ReviewStatus" NOT NULL DEFAULT 'DRAFT',
    "quality_score" DECIMAL(5,2),
    "created_by_user_id" UUID NOT NULL,
    "reviewed_by_user_id" UUID,
    "reviewed_at" TIMESTAMP(3),
    "usage_count" INTEGER NOT NULL DEFAULT 0,
    "last_used_at" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question_versions" (
    "id" UUID NOT NULL,
    "question_id" UUID NOT NULL,
    "version_number" INTEGER NOT NULL,
    "snapshot" JSONB NOT NULL,
    "changed_by_user_id" UUID NOT NULL,
    "change_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "question_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question_reviews" (
    "id" UUID NOT NULL,
    "question_id" UUID NOT NULL,
    "reviewer_user_id" UUID NOT NULL,
    "decision" "ReviewDecision" NOT NULL,
    "comments" TEXT,
    "previous_status" "ReviewStatus" NOT NULL,
    "new_status" "ReviewStatus" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "question_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "paper_blueprints" (
    "id" UUID NOT NULL,
    "institution_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "board_id" UUID NOT NULL,
    "syllabus_version_id" UUID NOT NULL,
    "medium_id" UUID NOT NULL,
    "standard_id" UUID NOT NULL,
    "subject_id" UUID NOT NULL,
    "total_marks" INTEGER NOT NULL,
    "duration_minutes" INTEGER NOT NULL,
    "instructions" TEXT[],
    "status" "BlueprintStatus" NOT NULL DEFAULT 'DRAFT',
    "created_by_user_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "paper_blueprints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blueprint_sections" (
    "id" UUID NOT NULL,
    "blueprint_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "display_order" INTEGER NOT NULL,
    "question_type" "QuestionType" NOT NULL,
    "marks_per_question" INTEGER NOT NULL,
    "question_count" INTEGER NOT NULL,
    "internal_choice_count" INTEGER NOT NULL DEFAULT 0,
    "is_compulsory" BOOLEAN NOT NULL DEFAULT true,
    "chapter_distribution" JSONB,
    "difficulty_distribution" JSONB,
    "bloom_distribution" JSONB,
    "source_constraints" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blueprint_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question_papers" (
    "id" UUID NOT NULL,
    "institution_id" UUID NOT NULL,
    "blueprint_id" UUID,
    "title" TEXT NOT NULL,
    "exam_name" TEXT,
    "board_id" UUID NOT NULL,
    "syllabus_version_id" UUID NOT NULL,
    "medium_id" UUID NOT NULL,
    "standard_id" UUID NOT NULL,
    "subject_id" UUID NOT NULL,
    "total_marks" INTEGER NOT NULL,
    "duration_minutes" INTEGER NOT NULL,
    "instructions" TEXT[],
    "status" "PaperStatus" NOT NULL DEFAULT 'GENERATED',
    "generation_mode" "GenerationMode" NOT NULL,
    "algorithm_version" TEXT NOT NULL,
    "generation_seed" TEXT NOT NULL,
    "generation_warnings" JSONB NOT NULL,
    "selection_decisions" JSONB NOT NULL,
    "created_by_user_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "question_papers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "paper_snapshots" (
    "id" UUID NOT NULL,
    "question_paper_id" UUID NOT NULL,
    "snapshot_version" INTEGER NOT NULL,
    "paper_data" JSONB NOT NULL,
    "checksum" TEXT NOT NULL,
    "created_by_user_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "paper_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "paper_question_usages" (
    "id" UUID NOT NULL,
    "question_paper_id" UUID NOT NULL,
    "question_id" UUID NOT NULL,
    "institution_id" UUID NOT NULL,
    "used_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "paper_question_usages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" BIGSERIAL NOT NULL,
    "institution_id" UUID,
    "actor_user_id" UUID,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "request_id" TEXT,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "before_data" JSONB,
    "after_data" JSONB,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_hash_key" ON "refresh_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "refresh_tokens_user_id_family_id_idx" ON "refresh_tokens"("user_id", "family_id");

-- CreateIndex
CREATE UNIQUE INDEX "institutions_slug_key" ON "institutions"("slug");

-- CreateIndex
CREATE INDEX "institution_members_user_id_status_idx" ON "institution_members"("user_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "institution_members_institution_id_user_id_key" ON "institution_members"("institution_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "boards_code_key" ON "boards"("code");

-- CreateIndex
CREATE UNIQUE INDEX "boards_slug_key" ON "boards"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "syllabus_versions_board_id_code_key" ON "syllabus_versions"("board_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "mediums_code_key" ON "mediums"("code");

-- CreateIndex
CREATE UNIQUE INDEX "standards_syllabus_version_id_code_key" ON "standards"("syllabus_version_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "subjects_standard_id_medium_id_code_key" ON "subjects"("standard_id", "medium_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "chapters_subject_id_code_key" ON "chapters"("subject_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "topics_chapter_id_slug_key" ON "topics"("chapter_id", "slug");

-- CreateIndex
CREATE INDEX "questions_institution_id_subject_id_chapter_id_idx" ON "questions"("institution_id", "subject_id", "chapter_id");

-- CreateIndex
CREATE INDEX "questions_review_status_question_type_marks_idx" ON "questions"("review_status", "question_type", "marks");

-- CreateIndex
CREATE INDEX "questions_usage_count_last_used_at_idx" ON "questions"("usage_count", "last_used_at");

-- CreateIndex
CREATE UNIQUE INDEX "question_versions_question_id_version_number_key" ON "question_versions"("question_id", "version_number");

-- CreateIndex
CREATE INDEX "paper_blueprints_institution_id_subject_id_idx" ON "paper_blueprints"("institution_id", "subject_id");

-- CreateIndex
CREATE INDEX "question_papers_institution_id_created_at_idx" ON "question_papers"("institution_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "paper_snapshots_question_paper_id_snapshot_version_key" ON "paper_snapshots"("question_paper_id", "snapshot_version");

-- CreateIndex
CREATE UNIQUE INDEX "paper_question_usages_question_paper_id_question_id_key" ON "paper_question_usages"("question_paper_id", "question_id");

-- CreateIndex
CREATE INDEX "audit_logs_institution_id_created_at_idx" ON "audit_logs"("institution_id", "created_at");

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "institutions" ADD CONSTRAINT "institutions_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "institution_members" ADD CONSTRAINT "institution_members_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "institution_members" ADD CONSTRAINT "institution_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "syllabus_versions" ADD CONSTRAINT "syllabus_versions_board_id_fkey" FOREIGN KEY ("board_id") REFERENCES "boards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "standards" ADD CONSTRAINT "standards_syllabus_version_id_fkey" FOREIGN KEY ("syllabus_version_id") REFERENCES "syllabus_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subjects" ADD CONSTRAINT "subjects_standard_id_fkey" FOREIGN KEY ("standard_id") REFERENCES "standards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subjects" ADD CONSTRAINT "subjects_medium_id_fkey" FOREIGN KEY ("medium_id") REFERENCES "mediums"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chapters" ADD CONSTRAINT "chapters_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "topics" ADD CONSTRAINT "topics_chapter_id_fkey" FOREIGN KEY ("chapter_id") REFERENCES "chapters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_board_id_fkey" FOREIGN KEY ("board_id") REFERENCES "boards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_syllabus_version_id_fkey" FOREIGN KEY ("syllabus_version_id") REFERENCES "syllabus_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_medium_id_fkey" FOREIGN KEY ("medium_id") REFERENCES "mediums"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_standard_id_fkey" FOREIGN KEY ("standard_id") REFERENCES "standards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_chapter_id_fkey" FOREIGN KEY ("chapter_id") REFERENCES "chapters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "topics"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_reviewed_by_user_id_fkey" FOREIGN KEY ("reviewed_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_versions" ADD CONSTRAINT "question_versions_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_versions" ADD CONSTRAINT "question_versions_changed_by_user_id_fkey" FOREIGN KEY ("changed_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_reviews" ADD CONSTRAINT "question_reviews_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_reviews" ADD CONSTRAINT "question_reviews_reviewer_user_id_fkey" FOREIGN KEY ("reviewer_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paper_blueprints" ADD CONSTRAINT "paper_blueprints_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paper_blueprints" ADD CONSTRAINT "paper_blueprints_board_id_fkey" FOREIGN KEY ("board_id") REFERENCES "boards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paper_blueprints" ADD CONSTRAINT "paper_blueprints_syllabus_version_id_fkey" FOREIGN KEY ("syllabus_version_id") REFERENCES "syllabus_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paper_blueprints" ADD CONSTRAINT "paper_blueprints_medium_id_fkey" FOREIGN KEY ("medium_id") REFERENCES "mediums"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paper_blueprints" ADD CONSTRAINT "paper_blueprints_standard_id_fkey" FOREIGN KEY ("standard_id") REFERENCES "standards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paper_blueprints" ADD CONSTRAINT "paper_blueprints_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paper_blueprints" ADD CONSTRAINT "paper_blueprints_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blueprint_sections" ADD CONSTRAINT "blueprint_sections_blueprint_id_fkey" FOREIGN KEY ("blueprint_id") REFERENCES "paper_blueprints"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_papers" ADD CONSTRAINT "question_papers_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_papers" ADD CONSTRAINT "question_papers_blueprint_id_fkey" FOREIGN KEY ("blueprint_id") REFERENCES "paper_blueprints"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_papers" ADD CONSTRAINT "question_papers_board_id_fkey" FOREIGN KEY ("board_id") REFERENCES "boards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_papers" ADD CONSTRAINT "question_papers_syllabus_version_id_fkey" FOREIGN KEY ("syllabus_version_id") REFERENCES "syllabus_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_papers" ADD CONSTRAINT "question_papers_medium_id_fkey" FOREIGN KEY ("medium_id") REFERENCES "mediums"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_papers" ADD CONSTRAINT "question_papers_standard_id_fkey" FOREIGN KEY ("standard_id") REFERENCES "standards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_papers" ADD CONSTRAINT "question_papers_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_papers" ADD CONSTRAINT "question_papers_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paper_snapshots" ADD CONSTRAINT "paper_snapshots_question_paper_id_fkey" FOREIGN KEY ("question_paper_id") REFERENCES "question_papers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paper_snapshots" ADD CONSTRAINT "paper_snapshots_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paper_question_usages" ADD CONSTRAINT "paper_question_usages_question_paper_id_fkey" FOREIGN KEY ("question_paper_id") REFERENCES "question_papers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paper_question_usages" ADD CONSTRAINT "paper_question_usages_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paper_question_usages" ADD CONSTRAINT "paper_question_usages_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
