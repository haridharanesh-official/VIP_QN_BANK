# MASTER CONTEXT PROMPT: QB365 Clean-Room Replacement Project
# Generated from complete research and architecture discussion
# Use this as the initial prompt for Cursor, Antigravity, or Codex CLI

---

## 1. PROJECT OVERVIEW

We are building **EduGen** — a clean-room replacement for QB365 (qb365.in), an Indian EdTech platform operated by Linlax InfoTech Pvt Ltd (founded 2012, Coimbatore, Tamil Nadu).

### What QB365 Does (Confirmed from Public Research)
- **5,00,000+** pre-loaded questions with answers and detailed solutions
- **Question Paper Generator** for teachers to create unlimited papers in ~5 minutes
- **Student LMS (SLMS)** for practice tests, performance analytics, competitive exam prep
- **Study Materials Portal** with free public Q&A pages for SEO acquisition
- **Bilingual support** (Tamil and English medium)
- **45,000+ teachers, 500+ schools, 130K+ papers prepared** (EIN Presswire, Apr 2026)
- Supports **Tamil Nadu State Board (Matriculation)** and **CBSE**, Classes 6-12
- Founded 2012, ISO 9001:2008 certified
- Parent company: **Linlax InfoTech Pvt Ltd**
- Related products: OnlineTestsIndia, OTI365, SchoolAutomationSoftwares

### Our Goal
Build a **functionally equivalent, modern, unified platform** — NOT a pixel-for-pixel copy. Original branding, original UI, original code, independently created educational content.

---

## 2. RESEARCH EVIDENCE SUMMARY

### Confirmed Findings (from public sources)
| ID | Finding | Source |
|----|---------|--------|
| E1 | 5L+ Q&A, Classes 6-12, unlimited papers | qb365.in homepage |
| E2 | Teacher portal with blueprint setup | qb365.in/what-is-qb365 + YouTube demo |
| E3 | CBSE portal at cbse.qb365.in | qb365.in/for-cbse |
| E4 | Student LMS (SLMS) with 500K+ questions | qb365.in/slms/ |
| E5 | Free study materials portal | qb365.in/studymaterials/ |
| E6 | TET Super Pack priced at ₹149 | qb365.in/login |
| E7 | Franchise program ₹50K-₹2L investment | qb365.in/franchise |
| E8 | Parent company = Linlax InfoTech | linlax.in |
| E9 | Related products: OTI, OTI365, SchoolAutomation | linlax.in case studies |
| E10 | 45K+ teachers, 500+ schools, 130K+ papers | EIN Presswire |
| E11 | Founded 2012, ISO 9001:2008 | qb365.in footer |
| E12 | Workflow: Login → Dashboard → Blueprint → Auto/Manual → Edit → Print | YouTube demo I32ikS-DpV0 |
| E13 | Question types: MCQ, image, diagram, formula, assertion-reason, case-based, HOTS | qb365.in/for-cbse |
| E14 | Export: PDF and Word/DOCX | Feature page + demo |
| E15 | School logo, watermark, custom fonts | Demo video 16:23 |
| E16 | Shuffle sets A/B/C, either/or, sub-questions | Demo video 14:40-17:24 |
| E17 | Identity tags: Exercise, PTA, Previous Year, Book Back, Creative | Demo video 20:56 |
| E18 | Payment: UPI, Cards, NetBanking, Cheque, Deposit | Franchise page |
| E19 | Cloud-based, responsive, mobile-friendly | Official claims |
| E20 | AI Question Paper feature launched | qb365.in/login banner |
| E21-23 | SLMS features, competitive exams, contact details | Multiple official pages |

### Inferred Architecture (Weak-Medium Confidence)
- Likely traditional web app (PHP/ASP.NET or similar)
- Not a SPA/API-first architecture
- Web-responsive only, no native mobile app
- Separate legacy systems for related products (OTI, SchoolAutomation)

---

## 3. ECOSYSTEM MAP

```
Linlax InfoTech
├── QB365 Main Platform
│   ├── qb365.in / www.qb365.in (Marketing + Teacher Portal)
│   ├── teacher.qb365.in (Question Paper Generator)
│   ├── cbse.qb365.in (CBSE-specific portal)
│   ├── qb365.in/slms/ (Student LMS)
│   └── qb365.in/studymaterials/ (Public content)
├── Online Tests India (onlinetestsindia.com)
├── OTI365 (oti365.com)
└── School Automation Softwares (schoolautomationsoftwares.com)
```

**Our replacement is a UNIFIED platform** — no fragmented subdomains.

---

## 4. COMPLETE FEATURE INVENTORY

### Teacher Question-Paper Generator (Core)
- Dashboard with purchased subjects
- Blueprint setup (marks, chapters, difficulty, Bloom's, source constraints)
- Automatic generation, Manual selection, Chapter-wise, Full-syllabus
- Question-type filtering (MCQ, 2M, 3M, 5M, Essay, etc.)
- Book Back / Creative / Previous Year / PTA filters
- Question replacement, editing, sub-questions, either/or
- Reorder, move between sections, add notes
- Print settings (font, spacing, layout)
- Hide RegNo/Time/Date
- School logo upload, watermark
- Shuffle questions, Multiple sets (A/B/C)
- PDF export, Word/DOCX export
- Answer key generation, Q-with-answer, Detailed solutions
- Duplicate/used-question check, Weightage view

### Student LMS (SLMS)
- Chapter-wise Q&A (Book Back, Creative, In-text, Competency, Case Study, HOTS, Previous Year)
- MCQ practice, Subject tests, Full mock exams
- Performance analytics, Strength/weakness, Progress tracking
- Competitive exam prep (NEET, JEE, NMMS, NTSE, Olympiads)
- Downloadable materials

### Public Study Materials
- Board/Class/Subject/Chapter pages (SEO-optimized)
- Free Q&A, MCQ tests, Previous year papers, Model papers
- Set A/Set B patterns, Tamil and English variants

### Online Testing
- Test scheduling, Class/student assignment
- Timer, Auto-save, Resume after disconnect
- Question navigation, Mark for review
- Randomized questions/options
- Negative marking, Section timing
- Auto-evaluation (MCQ), Manual evaluation (descriptive)
- Result publishing, Rank calculation

### Administrative
- User registration, Subscription management
- Institution branding, Bulk user management
- Payment processing (UPI/Card/NetBanking/Cheque)

---

## 5. USER ROLES & PERMISSIONS

| Role | Key Capabilities |
|------|-----------------|
| Anonymous | View public materials, Search questions |
| Student | Attempt tests, View results, Practice MCQ, Track progress |
| Individual Teacher | Generate papers, Download PDF/DOCX, Create questions |
| School Teacher | Same + Assign tests, View student results |
| HOD | Same + Manage department teachers, Review questions |
| School Admin | Manage teachers/students, Configure branding, Billing, Analytics |
| Tuition Owner | Multi-batch management, Competitive exam focus |
| Platform Admin | Manage taxonomy, Content approval, System config |
| Super Admin | Full platform control |

---

## 6. ACADEMIC TAXONOMY

```
Board
└── Syllabus Version
    └── Academic Year
        └── Medium (Tamil / English / Hindi)
            └── Standard (Class 6-12)
                └── Stream (Science / Commerce / Arts)
                    └── Subject
                        └── Term
                            └── Unit
                                └── Chapter
                                    └── Topic
                                        └── Learning Outcome
```

### Supported Curricula
| Board | Mediums | Classes | Streams |
|-------|---------|---------|---------|
| Tamil Nadu State Board | Tamil, English | 6-12 | Science, Commerce, Arts |
| CBSE | English, Hindi | 6-12 | Science, Commerce, Arts |

---

## 7. QUESTION-BANK SCHEMA (Key Fields)

Every question has:
- `id`, `tenant_id` (institution), `chapter_id`, `topic_id`
- `question_type`: MCQ_SINGLE, MCQ_MULTIPLE, TRUE_FALSE, FILL_IN_BLANK, ONE_WORD, MATCH_FOLLOWING, ASSERTION_REASON, CASE_STUDY, PASSAGE_BASED, IMAGE_BASED, DIAGRAM_BASED, MAP_BASED, NUMERICAL, FORMULA_BASED, VERY_SHORT_ANSWER, SHORT_ANSWER, LONG_ANSWER, ESSAY, PRACTICAL, PROGRAMMING, CODE_OUTPUT, TABLE_COMPLETION, ORDERING
- `marks`, `difficulty` (EASY/MEDIUM/HARD), `bloom_level` (Remember→Create)
- `question_text` (HTML/LaTeX/Markdown), `options` (JSON), `correct_answer`, `alternative_answers`
- `marking_scheme` (step-wise JSON), `solution`, `hint`, `explanation`, `formula` (LaTeX)
- `diagram_url`, `image_urls`
- `source`: TEXTBOOK, PREVIOUS_YEAR, CREATIVE, PTA, BOOK_BACK, EXERCISE, COMPETITIVE_EXAM
- `is_book_back`, `is_creative`, `is_previous_year`, `is_pta`, `is_hots`, `is_case_study`
- `tags` (string array), `review_status`, `quality_score`, `usage_count`, `last_used_date`
- `ai_generated`, `ai_provenance` (model, version, prompt, timestamp)
- Translations table for Tamil/English/Hindi

---

## 8. PAPER GENERATION ENGINE

### Generation Modes
1. **Manual**: Teacher browses bank, picks individual questions
2. **Automatic**: System selects based on simple criteria
3. **Blueprint-Based**: Detailed constraint satisfaction
4. **Chapter-Wise**: Focus on single/few chapters
5. **Full-Syllabus**: Balanced coverage
6. **Multiple Shuffled Sets**: Set A/B/C for exam security

### Blueprint Schema
```json
{
  "name": "Class 10 Maths - Half Yearly",
  "total_marks": 100,
  "duration_minutes": 180,
  "sections": [
    {
      "name": "Section A - MCQ",
      "question_type": "MCQ_SINGLE",
      "marks_per_question": 1,
      "num_questions": 20,
      "internal_choice": 0,
      "chapter_distribution": { "ch-1": 4, "ch-2": 4, ... },
      "difficulty_distribution": { "easy": 40, "medium": 40, "hard": 20 },
      "bloom_distribution": { "remember": 20, "understand": 30, "apply": 30, "analyze": 20 },
      "source_constraints": { "book_back_min_percent": 30, "previous_year_max_percent": 20 }
    }
  ],
  "global_constraints": {
    "avoid_recent_questions_days": 30,
    "max_similarity_threshold": 0.85,
    "language": "ENGLISH"
  }
}
```

### Algorithm: Hybrid Greedy + Backtracking
- **Phase 1**: Greedy constraint satisfaction (fast, 90% of cases)
- **Phase 2**: Backtracking repair (handles edge cases)
- Validates: total marks, question count, type match, internal choices, chapter balance, difficulty balance, Bloom's balance, reuse avoidance, similarity avoidance

---

## 9. TECH STACK (FINAL)

| Layer | Technology | Justification |
|-------|-----------|---------------|
| **Frontend** | Next.js 15 (App Router) + TypeScript + Tailwind CSS | SSR for SEO, React ecosystem |
| **Component Library** | shadcn/ui + Radix UI | Accessible, customizable |
| **Math Editor** | KaTeX (rendering) + MathQuill (input) | Fast, LaTeX standard |
| **State Management** | Zustand (client) + React Query (server) | Simple, effective |
| **Backend** | NestJS + TypeScript | Enterprise-grade, modular |
| **ORM** | Prisma | Type-safe, migration system |
| **Database** | PostgreSQL 16 | RLS support, JSONB, FTS |
| **Cache** | Redis 7 | Sessions, rate limiting, queues |
| **Search** | Meilisearch (self-hosted) | Fast setup, typo-tolerant, bilingual |
| **Queue** | BullMQ (Redis-based) | PDF gen, emails, AI tasks |
| **PDF Generation** | Playwright (primary) + python-docx (DOCX) | Perfect rendering, Tamil support |
| **Object Storage** | MinIO (self-hosted) or AWS S3 | S3-compatible |
| **Auth** | Passport.js + JWT + bcrypt | Standard, well-documented |
| **Payments** | Razorpay (India) | UPI, cards, netbanking |
| **Deployment** | Docker + Docker Compose (MVP) → Kubernetes (scale) | Portable |
| **AI** | OpenAI GPT-4o (JSON mode) | Question generation, classification |

---

## 10. PROJECT STRUCTURE (Already Generated)

```
qb365-replacement/
├── apps/
│   ├── web/              # Next.js 15 — Teacher + Student + Public + Admin
│   │   ├── src/app/      # App Router (Server Components)
│   │   ├── src/components/
│   │   ├── src/hooks/    # React Query hooks
│   │   └── src/lib/      # API client, utils
│   ├── api/              # NestJS — REST API + GraphQL
│   │   ├── src/
│   │   │   ├── auth/     # JWT auth, guards
│   │   │   ├── users/    # User management
│   │   │   ├── institutions/  # Multi-tenancy
│   │   │   ├── academic/    # Taxonomy
│   │   │   ├── questions/   # Question bank CRUD
│   │   │   ├── papers/      # Paper generation engine
│   │   │   ├── tests/       # Online testing
│   │   │   ├── search/      # Meilisearch integration
│   │   │   ├── payments/    # Razorpay integration
│   │   │   ├── content/     # Public materials CMS
│   │   │   ├── workers/     # BullMQ queue producers
│   │   │   └── audit/       # Audit logging
│   │   └── prisma/
│   │       ├── schema.prisma    # 50+ models
│   │       ├── migrations/
│   │       └── seed.ts
│   └── workers/          # BullMQ background workers
│       └── src/jobs/
│           ├── pdf-generation.ts   # Puppeteer + KaTeX + Handlebars
│           ├── email.ts
│           ├── ai-question.ts      # OpenAI GPT-4o
│           └── search-index.ts     # Meilisearch
├── packages/
│   ├── shared/           # Types, constants, utilities
│   └── ui/               # shadcn/ui component library
├── infra/
│   └── docker/           # Dockerfiles (API, Web, Workers)
├── docker-compose.yml    # Full stack: Postgres, Redis, Meilisearch, MinIO
├── .env.example          # All required env vars
├── .cursorrules          # Cursor AI rules
├── SKILL.md              # Agent context for all AI tools
└── README.md             # Full setup guide
```

---

## 11. KEY CONFIGURATION FILES

### .cursorrules (Critical for Cursor)
- Enforces: TypeScript strict, no `any`, explicit return types
- Architecture: controllers → services → repositories → Prisma
- Frontend: Server Components default, Client Components with 'use client'
- Database: Every model has created_at, updated_at, deleted_at (soft delete)
- Security: All user input → Zod validation, all queries include tenant_id
- Naming: kebab-case files, PascalCase components, snake_case DB tables

### SKILL.md (Critical for Antigravity + Codex)
- Domain concepts: academic taxonomy, paper generation modes
- Tech stack details
- Implementation patterns: "Adding a new feature" template
- Common tasks with step-by-step instructions
- Environment variables reference
- Build and test commands

---

## 12. DATABASE DESIGN HIGHLIGHTS

### Multi-Tenancy
- Shared database, shared schema
- `institution_id` on all tenant-scoped tables
- PostgreSQL RLS policies
- Service-layer validation on every request

### Critical Indexes
- `idx_questions_tenant_chapter` — paper generation performance
- `idx_questions_fts` — full-text search (GIN index)
- `idx_questions_usage` — reuse avoidance
- `idx_audit_logs_created_at` — compliance queries

### Key Tables (50+ total)
- `users`, `user_profiles`, `institutions`, `institution_members`
- `roles`, `permissions`, `user_roles`
- `boards`, `syllabus_versions`, `standards`, `subjects`, `chapters`, `topics`
- `questions`, `question_translations`, `question_reviews`, `question_versions`, `question_reports`
- `paper_blueprints`, `blueprint_sections`, `question_papers`, `paper_sections`, `paper_questions`, `paper_exports`
- `online_tests`, `test_assignments`, `attempts`, `student_answers`
- `plans`, `subscriptions`, `invoices`
- `public_materials`, `search_logs`, `audit_logs`, `background_jobs`

---

## 13. API DESIGN

### REST Endpoints (Public/Third-party)
```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
GET    /api/v1/boards
GET    /api/v1/boards/{id}/standards
GET    /api/v1/standards/{id}/subjects
GET    /api/v1/subjects/{id}/chapters
GET    /api/v1/questions                    # List with filters
POST   /api/v1/questions                  # Create
POST   /api/v1/blueprints                 # Create blueprint
POST   /api/v1/blueprints/{id}/generate   # Auto-generate paper
POST   /api/v1/papers                     # Create paper
POST   /api/v1/papers/{id}/export         # Queue PDF/DOCX
POST   /api/v1/tests                      # Create test
POST   /api/v1/tests/{id}/assign          # Assign to students
POST   /api/v1/attempts/{id}/submit       # Final submit
```

### GraphQL (Internal Frontends)
- Flexible queries for complex data fetching
- Used by Next.js app for dashboard, paper editor, test interface

---

## 14. SECURITY REQUIREMENTS

| Threat | Control |
|--------|---------|
| SQL Injection | Parameterized queries + Prisma ORM |
| XSS | Output encoding + CSP headers |
| CSRF | CSRF tokens + SameSite cookies |
| Auth bypass | JWT + refresh token rotation |
| Session hijacking | Short-lived JWT (15min), secure refresh |
| File upload abuse | Extension whitelist + virus scan (ClamAV) |
| Rate limiting | 100 req/IP per 15min window |
| Tenant isolation | RLS + service-layer checks + cache key prefix |
| Payment fraud | 3D Secure + webhook signature verification |
| Data breach | AES-256 at rest, TLS 1.3 in transit |

### Student Data Privacy (India)
- Data minimization (name, class, board, parent email/phone)
- Parental consent for under-18
- Retention: 2 years after graduation
- Self-service account deletion
- GDPR-style JSON export

### Question Paper Confidentiality
- Draft encryption (AES-256)
- Release date gating
- Per-user watermark (teacher name + timestamp)
- Download logging (user, IP, timestamp)
- Signed URL expiration (15 minutes)

---

## 15. AI INTEGRATION RULES

### AI-Generated Content Policy
- **NEVER auto-publish** AI-generated content
- Always goes to review queue (status: PENDING)
- Human reviewer must approve before publish
- Store provenance: model name, version, prompt, timestamp, confidence

### AI Features
| Feature | Model | Human Approval |
|---------|-------|----------------|
| Question generation | GPT-4o (JSON mode) | Required |
| Difficulty classification | GPT-4o | Spot-check |
| Bloom's classification | GPT-4o | Spot-check |
| Duplicate detection | Embedding similarity | Review if >0.85 |
| Translation assist | GPT-4o | Required |
| Personalized practice | Rule-based + AI | Auto (low risk) |

---

## 16. BUSINESS MODEL (Planned)

| Plan | Target | Price (INR) |
|------|--------|-------------|
| Free | Students | ₹0 |
| Student Pro | Individual students | ₹999/year |
| Teacher Basic | Individual teachers | ₹1,499/subject/year |
| Teacher Pro | Individual teachers | ₹4,999/year |
| School Starter | Small schools | ₹24,999/year |
| School Premium | Large schools | ₹49,999/year |
| Tuition Centre | Coaching centers | ₹19,999/year |
| TET Pack | TET aspirants | ₹149 |

---

## 17. IMPLEMENTATION ROADMAP

| Phase | Timeline | Deliverables |
|-------|----------|-------------|
| **Phase 0** | Month 1-2 | Architecture, DB schema, CI/CD, team onboarding |
| **Phase 1** | Month 3-4 | Auth, institutions, roles, academic taxonomy, question bank CRUD |
| **Phase 2** | Month 5-6 | Blueprint, auto/manual generation, paper editor, PDF export |
| **Phase 3** | Month 7-8 | Online tests, MCQ evaluation, results, basic analytics |
| **Phase 4** | Month 9-10 | Study materials portal, SEO pages, search, subscription gating |
| **Phase 5** | Month 11-12 | Bulk users, departments, multi-branch, advanced analytics |
| **Phase 6** | Month 13+ | AI question generation, semantic search, personalized practice |

### Recommended Starting Point
1. **One board**: Tamil Nadu State Board, English Medium, Classes 6-10
2. **Three subjects**: Mathematics, Science, Social Science
3. **Core feature**: Teacher question-paper generator with PDF export
4. **Then**: Student MCQ practice → Public SEO content → Expand

---

## 18. DEVELOPMENT TOOLS

We use three AI coding tools:

### Cursor (Primary IDE)
- VS Code fork with AI-first features
- Composer for multi-file edits
- Agent Mode for autonomous task execution
- Background Agents for async work
- Model switching: Claude, GPT, Gemini
- Cost: $20/month Pro

### Antigravity (Google)
- Parallel agents (up to 5 simultaneously)
- Built-in Chrome browser for frontend verification
- Gemini 3.1 Pro default
- VS Code compatible
- Cost: ~$20/month

### Codex CLI (OpenAI)
- Terminal-native coding agent
- Open source (Apache 2.0), Rust-based
- OS-level sandboxing
- GPT-5.4, GPT-5.3-Codex models
- Cost: Included with ChatGPT Plus ($20/month)

### How We Use Them
- **Cursor**: Daily development, multi-file refactors, debugging
- **Antigravity**: Parallel agents for frontend + backend + tests simultaneously
- **Codex CLI**: Terminal tasks, scaffolding, DevOps, code review

---

## 19. DOCKER SERVICES

```yaml
services:
  postgres:     # PostgreSQL 16 — Database
  redis:        # Redis 7 — Cache, Sessions, Queues
  meilisearch:  # Search engine
  minio:        # S3-compatible object storage
  api:          # NestJS API server
  web:          # Next.js frontend
  workers:      # BullMQ background workers
```

### Startup Commands
```bash
# Full stack
docker-compose up -d

# Database
pnpm db:generate
pnpm db:migrate
pnpm db:seed

# Development (individual)
pnpm --filter api dev
pnpm --filter web dev
pnpm --filter workers dev
```

---

## 20. CRITICAL CODING RULES

1. **TypeScript strict mode** everywhere — no `any`
2. **Explicit return types** on all public functions
3. **Zod validation** for all user input
4. **Prisma ORM** for all database access — no raw SQL
5. **Server Components** by default in Next.js — `use client` only when needed
6. **Dependency injection** in NestJS — never `new Service()`
7. **Tenant isolation** — every query includes `institution_id`
8. **Soft deletes** — use `deleted_at` not `DELETE`
9. **Audit logging** — every mutation logged
10. **AI content** — never auto-publish, always human review

---

## 21. ENVIRONMENT VARIABLES

```
DATABASE_URL=postgresql://qb365:qb365_dev_password@localhost:5432/qb365
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
S3_ENDPOINT=http://localhost:9000
S3_ACCESS_KEY=minio
S3_SECRET_KEY=minio123
S3_BUCKET=qb365-files
MEILISEARCH_HOST=http://localhost:7700
MEILISEARCH_API_KEY=masterKey
OPENAI_API_KEY=sk-your-openai-key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@edugen.in
RAZORPAY_KEY_ID=rzp_test_your_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
NODE_ENV=development
PORT=4000
API_URL=http://localhost:4000
NEXT_PUBLIC_API_URL=http://localhost:4000
```

---

## 22. NEXT STEPS (IMMEDIATE)

1. ✅ Project scaffold generated (80 files)
2. ⏳ Run `pnpm install` + `docker-compose up -d`
3. ⏳ Run `pnpm db:migrate` + `pnpm db:seed`
4. ⏳ Implement **Auth module** — register/login JWT flow
5. ⏳ Implement **Academic Taxonomy API** — CRUD for boards, standards, subjects, chapters
6. ⏳ Implement **Question Bank** — create/list questions with filters
7. ⏳ Implement **Paper Generator MVP** — manual selection + auto-generation
8. ⏳ Implement **PDF Export** — test Puppeteer + KaTeX pipeline
9. ⏳ Implement **Student LMS** — MCQ practice with instant results

---

## 23. LEGAL & ETHICAL BOUNDARIES

- This is a **clean-room functional analysis**
- No authentication bypass attempted
- No proprietary code, design, or content copied
- Original branding (EduGen), original UI, original code
- Educational content must be independently created or properly licensed
- Use "functional equivalent" or "clean-room alternative" terminology
- QB365 is a trademark of Linlax InfoTech — we do not use it

---

## 24. RISK REGISTER

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Content copyright | Medium | High | Original content only |
| Academic accuracy | Medium | Critical | Two-step review, SME sign-off |
| Question scarcity at launch | High | High | Start with 1 board + 3 subjects |
| Syllabus changes | High | Medium | Versioned taxonomy, migration tools |
| Tamil rendering | Low | Medium | Test with Noto Sans Tamil |
| Search quality | Medium | Medium | Start with PostgreSQL FTS |
| PDF reliability | Medium | Medium | Playwright + fallback |
| Tenant isolation breach | Low | Critical | RLS + integration tests |
| Exam-day scaling | Medium | High | Load test at 10x expected |
| AI hallucination | Medium | Medium | Human-in-the-loop |

---

## 25. CONTACT & RESOURCES

- **Project**: EduGen (QB365 clean-room replacement)
- **Architecture**: Modular monolith → Microservices (future)
- **Deployment**: Docker Compose (MVP) → Kubernetes (scale)
- **Target Market**: Indian schools — Tamil Nadu State Board, CBSE
- **Primary Languages**: English, Tamil, Hindi
- **Competitive Advantage**: Unified platform, modern UX, AI-assisted creation, superior institutional management

---

# END OF CONTEXT
# Use this entire prompt as the initial context when starting work with Cursor, Antigravity, or Codex CLI
