# EduGen API

Base URL: `http://localhost:4000/api/v1`. JSON failures use:

```json
{"error":{"code":"VALIDATION_ERROR","message":"Request validation failed.","details":{},"requestId":"req_..."}}
```

Tenant endpoints require an access cookie (or Bearer access token) and `X-Institution-Id`. HTTP status meanings are 400 validation, 401 authentication, 403 authorization/tenant, 404 hidden or absent record, 409 conflict, and 422 domain constraint.

## Authentication

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /auth/me`

## Institution

- `GET /institutions/current`
- `GET /institutions/members`
- `POST /institutions/members` (owner/admin)
- `GET /institutions/dashboard`

## Academic taxonomy

- `GET|POST /academic/boards`, `GET /academic/boards/:boardId`
- `GET /academic/boards/:boardId/syllabus-versions`, `POST /academic/syllabus-versions`
- `GET /academic/mediums`
- `GET|POST /academic/standards`
- `GET|POST /academic/subjects`
- `GET|POST /academic/chapters`
- `GET|POST /academic/topics`

Reads are ordered. Filters include syllabus version, standard, medium, subject, and chapter. Writes require owner/admin in this development milestone.

## Questions

- `POST|GET /questions`
- `GET|PATCH|DELETE /questions/:id`
- `POST /questions/:id/submit-review`
- `POST /questions/:id/review`
- `GET /questions/:id/versions`
- `GET /questions/:id/reviews`

List filters include pagination, text search, taxonomy, type, marks, difficulty, status, scope, creator and source flags. PATCH requires `version` for optimistic concurrency.

## Blueprints and papers

- `POST|GET /blueprints`
- `GET|PATCH|DELETE /blueprints/:id`
- `POST /blueprints/:id/validate`
- `POST /blueprints/:id/generate`
- `GET /papers`
- `GET /papers/:id?view=QUESTION_PAPER|ANSWER_KEY|QUESTIONS_WITH_ANSWERS`
- `GET /papers/:id/snapshot?view=...`
- `POST /papers/:id/archive`

Validation errors return structured codes including `MARK_TOTAL_MISMATCH`, `INTERNAL_CHOICE_INVALID`, `INVALID_DIFFICULTY_DISTRIBUTION`, and `INSUFFICIENT_QUESTION_POOL`.
