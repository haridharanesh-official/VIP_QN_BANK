import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from "@nestjs/common";
import type { Request, Response } from "express";

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const request = host.switchToHttp().getRequest<Request>();
    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const payload = exception instanceof HttpException ? exception.getResponse() : undefined;
    const record = typeof payload === "object" && payload !== null ? payload as Record<string, unknown> : {};
    const message = status === 500 ? "An unexpected error occurred." : typeof record.message === "string" ? record.message : typeof payload === "string" ? payload : "Request failed.";
    response.status(status).json({ error: { code: typeof record.code === "string" ? record.code : status === 500 ? "INTERNAL_ERROR" : "REQUEST_FAILED", message, ...(record.details === undefined ? {} : { details: record.details }), requestId: request.requestId ?? "unknown" } });
  }
}
