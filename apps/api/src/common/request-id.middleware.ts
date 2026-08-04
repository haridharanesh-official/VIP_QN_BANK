import { randomUUID } from "node:crypto";
import type { NextFunction, Request, Response } from "express";

export function requestIdMiddleware(request: Request, response: Response, next: NextFunction): void {
  request.requestId = typeof request.headers["x-request-id"] === "string" ? request.headers["x-request-id"] : `req_${randomUUID()}`;
  response.setHeader("x-request-id", request.requestId);
  next();
}
