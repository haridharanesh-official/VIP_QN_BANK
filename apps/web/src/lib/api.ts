import { createClient } from "./supabase/client";
import { browserDevelopmentAuthBypassEnabled } from "./development-auth";
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";
export class ApiError extends Error { constructor(readonly code: string, message: string, readonly details?: unknown) { super(message); } }
export async function api<T>(path: string, init: RequestInit = {}, tenant = true): Promise<T> {
  const institutionId = typeof window === "undefined" ? null : window.localStorage.getItem("edugen_institution_id");
  const headers = new Headers(init.headers);
  if (!headers.has("content-type")) headers.set("content-type", "application/json");
  if (tenant && institutionId) headers.set("x-institution-id", institutionId);
  if (!browserDevelopmentAuthBypassEnabled()) {
    const { data: { session } } = await createClient().auth.getSession();
    if (session?.access_token && !headers.has("authorization")) headers.set("authorization", `Bearer ${session.access_token}`);
  }
  const response = await fetch(`${API_URL}${path}`, { ...init, credentials: "include", headers });
  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) { const error = body && typeof body === "object" ? Reflect.get(body, "error") : undefined; throw new ApiError(typeof Reflect.get(error ?? {}, "code") === "string" ? Reflect.get(error, "code") : "REQUEST_FAILED", typeof Reflect.get(error ?? {}, "message") === "string" ? Reflect.get(error, "message") : "Request failed", Reflect.get(error ?? {}, "details")); }
  return body as T;
}
