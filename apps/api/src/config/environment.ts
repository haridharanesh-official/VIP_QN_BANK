import { z } from "zod";

const environmentSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
  FRONTEND_URL: z.string().url().default("http://localhost:3000"),
  COOKIE_SECURE: z.enum(["true", "false"]).default("false"),
  COOKIE_DOMAIN: z.string().optional(),
  PORT: z.coerce.number().int().positive().default(4000),
  REDIS_URL: z.string().url().default("redis://localhost:6379"),
  REDIS_REQUIRED: z.enum(["true", "false"]).default("false"),
  AUTH_PROVIDER: z.enum(["legacy", "supabase"]).default("legacy"),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1).optional(),
});
export type Environment = z.infer<typeof environmentSchema>;
export function readEnvironment(): Environment {
  const parsed = environmentSchema.safeParse(process.env);
  if (!parsed.success) throw new Error(`Invalid environment configuration: ${parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join(", ")}`);
  return parsed.data;
}
export function durationSeconds(value: string): number {
  const match = /^(\d+)([smhd])$/.exec(value);
  if (!match) throw new Error(`Invalid duration: ${value}`);
  const units: Readonly<Record<string, number>> = { s: 1, m: 60, h: 3600, d: 86400 };
  return Number(match[1]) * units[match[2]];
}
