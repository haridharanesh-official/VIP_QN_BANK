import { HttpStatus, Injectable } from "@nestjs/common";
import { createPublicKey, verify as verifySignature, type JsonWebKey, type KeyObject } from "node:crypto";
import { AppError } from "../../common/app-error";
import { readEnvironment } from "../../config/environment";

interface SupabaseJwtHeader { readonly alg?: unknown; readonly kid?: unknown }
interface SupabaseJwtPayload { readonly sub?: unknown; readonly email?: unknown; readonly iss?: unknown; readonly aud?: unknown; readonly exp?: unknown; readonly nbf?: unknown }
interface SupabaseJwk { readonly kty: string; readonly kid: string; readonly use?: string; readonly alg?: string; readonly n?: string; readonly e?: string; readonly crv?: string; readonly x?: string; readonly y?: string }
interface SupabaseJwks { readonly keys: readonly SupabaseJwk[] }
export interface SupabaseIdentity { readonly sub: string; readonly email: string }

@Injectable()
export class SupabaseJwtVerifier {
  private readonly keys = new Map<string, KeyObject>();
  private keysExpireAt = 0;

  async verify(token: string): Promise<SupabaseIdentity> {
    const environment = readEnvironment();
    const projectUrl = environment.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
    if (!projectUrl) throw new AppError("SUPABASE_AUTH_NOT_CONFIGURED", "Supabase authentication is not configured.", HttpStatus.SERVICE_UNAVAILABLE);
    const segments = token.split(".");
    if (segments.length !== 3) throw this.invalidToken();
    const header = this.decodeJson<SupabaseJwtHeader>(segments[0]);
    const payload = this.decodeJson<SupabaseJwtPayload>(segments[1]);
    if ((header.alg !== "RS256" && header.alg !== "ES256") || typeof header.kid !== "string") throw this.invalidToken();
    const key = await this.getKey(projectUrl, header.kid);
    const signatureInput = Buffer.from(`${segments[0]}.${segments[1]}`);
    const signature = Buffer.from(segments[2], "base64url");
    const validSignature = header.alg === "RS256"
      ? verifySignature("RSA-SHA256", signatureInput, key, signature)
      : verifySignature("SHA256", signatureInput, { key, dsaEncoding: "ieee-p1363" }, signature);
    const now = Math.floor(Date.now() / 1000);
    const audience = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
    if (!validSignature || payload.iss !== `${projectUrl}/auth/v1` || !audience.includes("authenticated") || typeof payload.exp !== "number" || payload.exp <= now || (typeof payload.nbf === "number" && payload.nbf > now) || typeof payload.sub !== "string" || !this.isUuid(payload.sub) || typeof payload.email !== "string" || !payload.email.trim()) throw this.invalidToken();
    return { sub: payload.sub, email: payload.email.trim().toLowerCase() };
  }

  private async getKey(projectUrl: string, kid: string): Promise<KeyObject> {
    if (Date.now() >= this.keysExpireAt || !this.keys.has(kid)) await this.refreshKeys(projectUrl);
    const key = this.keys.get(kid);
    if (!key) throw this.invalidToken();
    return key;
  }

  private async refreshKeys(projectUrl: string): Promise<void> {
    let response: Response;
    try { response = await fetch(`${projectUrl}/auth/v1/.well-known/jwks.json`, { signal: AbortSignal.timeout(5_000), cache: "no-store" }); }
    catch { throw new AppError("AUTH_VERIFICATION_UNAVAILABLE", "Authentication verification is temporarily unavailable.", HttpStatus.SERVICE_UNAVAILABLE); }
    if (!response.ok) throw new AppError("AUTH_VERIFICATION_UNAVAILABLE", "Authentication verification is temporarily unavailable.", HttpStatus.SERVICE_UNAVAILABLE);
    const jwks = await response.json() as SupabaseJwks;
    this.keys.clear();
    for (const jwk of jwks.keys ?? []) {
      const usableRsa = jwk.kty === "RSA" && jwk.n && jwk.e;
      const usableEc = jwk.kty === "EC" && jwk.crv === "P-256" && jwk.x && jwk.y;
      if (jwk.kid && (usableRsa || usableEc)) this.keys.set(jwk.kid, createPublicKey({ key: jwk as unknown as JsonWebKey, format: "jwk" }));
    }
    this.keysExpireAt = Date.now() + 10 * 60_000;
  }

  private decodeJson<T>(segment: string): T {
    try { return JSON.parse(Buffer.from(segment, "base64url").toString("utf8")) as T; }
    catch { throw this.invalidToken(); }
  }
  private isUuid(value: string): boolean { return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value); }
  private invalidToken(): AppError { return new AppError("INVALID_ACCESS_TOKEN", "The access token is invalid or expired.", HttpStatus.UNAUTHORIZED); }
}
