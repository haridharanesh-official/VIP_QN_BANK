import { AppError } from "./app-error";
import { HttpStatus } from "@nestjs/common";
import type { output, ZodTypeAny } from "zod";

export function parseInput<S extends ZodTypeAny>(schema: S, value: unknown): output<S> {
  const result = schema.safeParse(value);
  if (!result.success) throw new AppError("VALIDATION_ERROR", "Request validation failed.", HttpStatus.BAD_REQUEST, result.error.flatten());
  return result.data;
}
