import { z } from "zod";

export const institutionTypes = ["SCHOOL", "TUITION_CENTRE", "INDIVIDUAL", "COLLEGE", "OTHER"] as const;
export const memberRoles = ["OWNER", "ADMIN", "HOD", "TEACHER", "CONTENT_REVIEWER"] as const;
export const questionTypes = ["MCQ_SINGLE", "MCQ_MULTIPLE", "TRUE_FALSE", "FILL_IN_BLANK", "ONE_WORD", "ASSERTION_REASON", "CASE_STUDY", "NUMERICAL", "VERY_SHORT_ANSWER", "SHORT_ANSWER", "LONG_ANSWER", "ESSAY"] as const;
export const difficulties = ["EASY", "MEDIUM", "HARD"] as const;
export const bloomLevels = ["REMEMBER", "UNDERSTAND", "APPLY", "ANALYZE", "EVALUATE", "CREATE"] as const;
export const reviewStatuses = ["DRAFT", "PENDING_REVIEW", "APPROVED", "CHANGES_REQUESTED", "REJECTED", "ARCHIVED"] as const;
export const ownershipScopes = ["GLOBAL", "INSTITUTION", "PRIVATE"] as const;

const password = z.string().min(10).max(128).regex(/[a-z]/, "Password needs a lowercase letter").regex(/[A-Z]/, "Password needs an uppercase letter").regex(/[0-9]/, "Password needs a number");
export const registerSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  email: z.string().trim().email().max(254),
  password,
  institutionName: z.string().trim().min(2).max(160),
  institutionType: z.enum(institutionTypes),
}).strict();
export const loginSchema = z.object({ email: z.string().trim().email(), password: z.string().min(1).max(128) }).strict();
export const supabaseBootstrapSchema = registerSchema.omit({ email: true, password: true });

export const questionCreateSchema = z.object({
  ownershipScope: z.enum(ownershipScopes).default("INSTITUTION"),
  boardId: z.string().uuid(), syllabusVersionId: z.string().uuid(), mediumId: z.string().uuid(),
  standardId: z.string().uuid(), subjectId: z.string().uuid(), chapterId: z.string().uuid(), topicId: z.string().uuid().optional(),
  questionType: z.enum(questionTypes), marks: z.coerce.number().int().positive().max(100), difficulty: z.enum(difficulties),
  bloomLevel: z.enum(bloomLevels), questionText: z.string().trim().min(3).max(20000), questionTextFormat: z.enum(["PLAIN_TEXT", "MARKDOWN", "HTML", "LATEX"]).default("PLAIN_TEXT"),
  correctAnswer: z.unknown(), alternativeAnswers: z.unknown().optional(), solution: z.string().max(30000).optional(), explanation: z.string().max(30000).optional(), hint: z.string().max(5000).optional(),
  markingScheme: z.unknown().optional(), options: z.array(z.object({ id: z.string().min(1), text: z.string().min(1) }).strict()).min(2).optional(),
  sourceType: z.string().trim().min(1).max(80), sourceReference: z.string().max(500).optional(),
  isBookBack: z.boolean().default(false), isCreative: z.boolean().default(false), isPreviousYear: z.boolean().default(false), isPta: z.boolean().default(false), isHots: z.boolean().default(false), isCaseStudy: z.boolean().default(false),
}).strict().superRefine((data, context) => {
  if (data.questionType.startsWith("MCQ") && !data.options) context.addIssue({ code: z.ZodIssueCode.custom, path: ["options"], message: "MCQ questions require options" });
  if (data.questionType.startsWith("MCQ") && data.options && typeof data.correctAnswer === "string" && !data.options.some((option) => option.id === data.correctAnswer)) context.addIssue({ code: z.ZodIssueCode.custom, path: ["correctAnswer"], message: "Correct option is not in options" });
});
export const questionUpdateSchema = questionCreateSchema.innerType().partial().extend({ version: z.number().int().positive(), changeReason: z.string().max(500).optional() }).strict();
export const reviewSchema = z.object({ decision: z.enum(["APPROVED", "CHANGES_REQUESTED", "REJECTED"]), comments: z.string().trim().max(2000).optional() }).strict().superRefine((data, context) => {
  if (data.decision !== "APPROVED" && !data.comments) context.addIssue({ code: z.ZodIssueCode.custom, path: ["comments"], message: "Comments are required" });
});

const distributionSchema = z.record(z.string(), z.number().min(0).max(100));
export const blueprintSectionSchema = z.object({
  name: z.string().trim().min(1).max(120), description: z.string().max(500).optional(), displayOrder: z.number().int().nonnegative(),
  questionType: z.enum(questionTypes), marksPerQuestion: z.number().int().positive(), questionCount: z.number().int().positive(), internalChoiceCount: z.number().int().nonnegative().default(0), isCompulsory: z.boolean().default(true),
  chapterDistribution: z.record(z.string().uuid(), z.number().int().nonnegative()).optional(), difficultyDistribution: distributionSchema.optional(), bloomDistribution: distributionSchema.optional(), sourceConstraints: z.record(z.string(), z.number().nonnegative()).optional(),
}).strict();
export const blueprintCreateSchema = z.object({
  name: z.string().trim().min(2).max(160), description: z.string().max(1000).optional(), boardId: z.string().uuid(), syllabusVersionId: z.string().uuid(), mediumId: z.string().uuid(), standardId: z.string().uuid(), subjectId: z.string().uuid(),
  totalMarks: z.number().int().positive(), durationMinutes: z.number().int().positive(), instructions: z.array(z.string().min(1).max(500)).default([]), sections: z.array(blueprintSectionSchema).min(1),
}).strict();
export const blueprintUpdateSchema = blueprintCreateSchema.partial().strict();

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type SupabaseBootstrapInput = z.infer<typeof supabaseBootstrapSchema>;
export type QuestionCreateInput = z.infer<typeof questionCreateSchema>;
export type QuestionUpdateInput = z.infer<typeof questionUpdateSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
export type BlueprintCreateInput = z.infer<typeof blueprintCreateSchema>;
export type BlueprintUpdateInput = z.infer<typeof blueprintUpdateSchema>;
export type BlueprintSectionInput = z.infer<typeof blueprintSectionSchema>;

export interface ApiErrorBody { readonly error: { readonly code: string; readonly message: string; readonly details?: unknown; readonly requestId: string } }
export interface PageResult<T> { readonly items: readonly T[]; readonly page: number; readonly pageSize: number; readonly total: number; readonly totalPages: number }
