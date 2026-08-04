-- LEGACY MILESTONE 1 REFERENCE ONLY.
-- The canonical production schema is apps/api/prisma/schema.prisma and its migrations.
-- This file is intentionally not mounted by docker-compose.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE user_role AS ENUM ('SUPER_ADMIN','PLATFORM_ADMIN','INSTITUTION_ADMIN','HOD','TEACHER','STUDENT');
CREATE TYPE question_status AS ENUM ('DRAFT','PENDING_REVIEW','APPROVED','REJECTED','ARCHIVED');
CREATE TYPE question_difficulty AS ENUM ('EASY','MEDIUM','HARD');
CREATE TYPE question_type AS ENUM ('MCQ_SINGLE','VERY_SHORT','SHORT_ANSWER','LONG_ANSWER','NUMERICAL','ASSERTION_REASON','CASE_STUDY');
CREATE TYPE paper_status AS ENUM ('DRAFT','GENERATED','APPROVED','ARCHIVED');

CREATE TABLE institutions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  logo_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  display_name text NOT NULL,
  role user_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE TABLE institution_members (
  institution_id uuid NOT NULL REFERENCES institutions(id),
  user_id uuid NOT NULL REFERENCES users(id),
  role user_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (institution_id, user_id)
);

CREATE TABLE boards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL
);

CREATE TABLE syllabus_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id uuid NOT NULL REFERENCES boards(id),
  code text NOT NULL,
  academic_year text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  UNIQUE(board_id, code)
);

CREATE TABLE standards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  syllabus_version_id uuid NOT NULL REFERENCES syllabus_versions(id),
  code text NOT NULL,
  name text NOT NULL,
  sort_order integer NOT NULL,
  UNIQUE(syllabus_version_id, code)
);

CREATE TABLE subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  standard_id uuid NOT NULL REFERENCES standards(id),
  code text NOT NULL,
  name text NOT NULL,
  medium text NOT NULL,
  UNIQUE(standard_id, code, medium)
);

CREATE TABLE chapters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id uuid NOT NULL REFERENCES subjects(id),
  code text NOT NULL,
  name text NOT NULL,
  sort_order integer NOT NULL,
  UNIQUE(subject_id, code)
);

CREATE TABLE questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid REFERENCES institutions(id),
  chapter_id uuid NOT NULL REFERENCES chapters(id),
  type question_type NOT NULL,
  marks integer NOT NULL CHECK (marks > 0),
  difficulty question_difficulty NOT NULL,
  bloom_level text NOT NULL,
  source_type text NOT NULL,
  language text NOT NULL,
  question_text jsonb NOT NULL,
  options jsonb,
  correct_answer jsonb NOT NULL,
  solution jsonb,
  status question_status NOT NULL DEFAULT 'DRAFT',
  usage_count integer NOT NULL DEFAULT 0,
  last_used_at timestamptz,
  version integer NOT NULL DEFAULT 1,
  created_by uuid REFERENCES users(id),
  reviewed_by uuid REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE INDEX idx_questions_generation_pool
  ON questions(chapter_id, type, marks, difficulty, status)
  WHERE deleted_at IS NULL;
CREATE INDEX idx_questions_usage
  ON questions(usage_count, last_used_at)
  WHERE status = 'APPROVED' AND deleted_at IS NULL;
CREATE INDEX idx_questions_text_gin ON questions USING gin(question_text);

CREATE TABLE paper_blueprints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES institutions(id),
  name text NOT NULL,
  subject_id uuid NOT NULL REFERENCES subjects(id),
  total_marks integer NOT NULL CHECK (total_marks > 0),
  duration_minutes integer NOT NULL CHECK (duration_minutes > 0),
  rules jsonb NOT NULL,
  created_by uuid NOT NULL REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE TABLE question_papers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES institutions(id),
  blueprint_id uuid REFERENCES paper_blueprints(id),
  name text NOT NULL,
  status paper_status NOT NULL DEFAULT 'DRAFT',
  total_marks integer NOT NULL,
  duration_minutes integer NOT NULL,
  snapshot jsonb NOT NULL,
  generation_metadata jsonb NOT NULL,
  created_by uuid NOT NULL REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE INDEX idx_papers_institution_created
  ON question_papers(institution_id, created_at DESC)
  WHERE deleted_at IS NULL;

CREATE TABLE audit_logs (
  id bigserial PRIMARY KEY,
  institution_id uuid REFERENCES institutions(id),
  actor_id uuid REFERENCES users(id),
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text NOT NULL,
  before_state jsonb,
  after_state jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO boards(code, name) VALUES
  ('TN_STATE', 'Tamil Nadu State Board'),
  ('CBSE', 'Central Board of Secondary Education');
