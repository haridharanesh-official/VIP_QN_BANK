-- Enable Row Level Security (RLS) on all tables
-- This ensures that if the database is ever accessed directly via the Data API by anon/authenticated users,
-- they cannot read or write any rows unless explicit policies are granted.
-- The NestJS API uses the `postgres` role which bypasses RLS, so the API will continue to function normally.

ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "refresh_tokens" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "institutions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "institution_members" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "boards" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "syllabus_versions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "mediums" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "standards" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "subjects" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "chapters" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "topics" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "questions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "question_versions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "question_reviews" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "paper_blueprints" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "blueprint_sections" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "question_papers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "paper_snapshots" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "paper_question_usages" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "audit_logs" ENABLE ROW LEVEL SECURITY;