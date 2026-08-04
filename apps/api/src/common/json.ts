import { Prisma } from "@prisma/client";
export function toJson(value: unknown): Prisma.InputJsonValue {
  if (value === null) throw new Error("Top-level JSON null is not supported");
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return value;
  if (Array.isArray(value)) return value.map(toJson);
  if (typeof value === "object") {
    const output: Record<string, Prisma.InputJsonValue> = {};
    for (const key of Object.keys(value)) output[key] = toJson(Reflect.get(value, key));
    return output;
  }
  throw new Error("Value is not JSON serializable");
}
