-- Prepared policies for a future database-session tenant context.
-- They are intentionally not enabled by the Milestone 2 runtime because Prisma's
-- pool does not yet set app.current_institution_id/app.current_user_id per transaction.
-- Service-layer InstitutionGuard checks remain mandatory.

CREATE POLICY questions_tenant_select ON questions FOR SELECT USING (
  ownership_scope = 'GLOBAL' OR
  institution_id = NULLIF(current_setting('app.current_institution_id', true), '')::uuid
);
CREATE POLICY questions_tenant_write ON questions FOR ALL USING (
  institution_id = NULLIF(current_setting('app.current_institution_id', true), '')::uuid
) WITH CHECK (
  institution_id = NULLIF(current_setting('app.current_institution_id', true), '')::uuid
);
CREATE POLICY blueprints_tenant_all ON paper_blueprints FOR ALL USING (
  institution_id = NULLIF(current_setting('app.current_institution_id', true), '')::uuid
) WITH CHECK (
  institution_id = NULLIF(current_setting('app.current_institution_id', true), '')::uuid
);
CREATE POLICY papers_tenant_all ON question_papers FOR ALL USING (
  institution_id = NULLIF(current_setting('app.current_institution_id', true), '')::uuid
) WITH CHECK (
  institution_id = NULLIF(current_setting('app.current_institution_id', true), '')::uuid
);
CREATE POLICY audit_tenant_select ON audit_logs FOR SELECT USING (
  institution_id = NULLIF(current_setting('app.current_institution_id', true), '')::uuid
);
