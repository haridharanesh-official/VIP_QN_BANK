import { HttpException, HttpStatus } from "@nestjs/common";

export class AppError extends HttpException {
  constructor(readonly code: string, message: string, status: HttpStatus, readonly details?: unknown) {
    super({ code, message, details }, status);
  }
}
