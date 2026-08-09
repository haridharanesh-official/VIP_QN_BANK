import { createClient } from "./supabase/client";

export const API_URL = typeof window === "undefined"
  ? (process.env.API_URL ? `${process.env.API_URL}/api/v1` : "http://localhost:4000/api/v1")
  : "/api/v1";

export class ApiError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly status: number,
    readonly details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function api<T>(path: string, init: RequestInit = {}, tenant = true): Promise<T> {
  const institutionId = typeof window === "undefined" ? null : window.localStorage.getItem("edugen_institution_id");
  const headers = new Headers(init.headers);
  
  if (!headers.has("content-type")) headers.set("content-type", "application/json");
  if (tenant && institutionId) headers.set("x-institution-id", institutionId);
  if (!headers.has("x-request-id")) headers.set("x-request-id", crypto.randomUUID());

  const { data: { session } } = await createClient().auth.getSession();
  if (session?.access_token && !headers.has("authorization")) {
    headers.set("authorization", `Bearer ${session.access_token}`);
  }

  const response = await fetch(`${API_URL}${path}`, { ...init, credentials: "include", headers });

  if (response.status === 401 && typeof window !== "undefined" && !path.includes("/auth")) {
    // Optionally trigger a logout or redirect event if needed
    window.location.href = "/login?reason=unauthenticated";
    throw new ApiError("UNAUTHENTICATED", "Your session has expired. Sign in again.", 401);
  }

  const body: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    let errorCode = "REQUEST_FAILED";
    let errorMessage = "Request failed";
    let errorDetails;

    if (body && typeof body === "object" && Reflect.has(body, "error")) {
      const errorObj = Reflect.get(body, "error");
      if (typeof errorObj === "object" && errorObj !== null) {
        errorCode = typeof Reflect.get(errorObj, "code") === "string" ? Reflect.get(errorObj, "code") as string : errorCode;
        errorMessage = typeof Reflect.get(errorObj, "message") === "string" ? Reflect.get(errorObj, "message") as string : errorMessage;
        errorDetails = Reflect.get(errorObj, "details");
      } else if (typeof errorObj === "string") {
        errorMessage = errorObj;
      }
    } else if (response.status === 403) {
      errorCode = "FORBIDDEN";
      errorMessage = "You don't have permission to perform this action.";
    }

    throw new ApiError(errorCode, errorMessage, response.status, errorDetails);
  }

  return body as T;
}
