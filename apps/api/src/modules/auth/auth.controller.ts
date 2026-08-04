import { Body, Controller, Get, HttpStatus, Ip, Post, Req, Res, UseGuards } from "@nestjs/common";
import type { Request, Response } from "express";
import { loginSchema, registerSchema, supabaseBootstrapSchema } from "@edugen/shared";
import { parseInput } from "../../common/zod";
import { AppError } from "../../common/app-error";
import { AuthGuard } from "./auth.guards";
import { CurrentUser } from "./auth.decorators";
import type { AuthResult, AuthUser } from "./auth.types";
import { AuthService } from "./auth.service";

@Controller("auth")
export class AuthController {
  constructor(private readonly service: AuthService) {}
  @Post("register") register(@Body() body: unknown, @Res({ passthrough: true }) response: Response, @Req() request: Request, @Ip() ip: string): Promise<AuthResult> { return this.service.register(parseInput(registerSchema, body), response, request.requestId, ip); }
  @Post("login") login(@Body() body: unknown, @Res({ passthrough: true }) response: Response, @Req() request: Request, @Ip() ip: string): Promise<AuthResult> { return this.service.login(parseInput(loginSchema, body), response, request.requestId, ip); }
  @Post("refresh") refresh(@Req() request: Request, @Res({ passthrough: true }) response: Response): Promise<AuthResult> { return this.service.refresh(request.cookies?.edugen_refresh, response); }
  @Post("logout") async logout(@Req() request: Request, @Res({ passthrough: true }) response: Response): Promise<{ success: true }> { await this.service.logout(request.cookies?.edugen_refresh, response); return { success: true }; }
  @Post("supabase/bootstrap") bootstrapSupabase(@Body() body: unknown, @Req() request: Request, @Ip() ip: string): Promise<AuthResult> {
    const authorization = request.headers.authorization;
    const token = authorization?.startsWith("Bearer ") ? authorization.slice(7) : undefined;
    if (!token) throw new AppError("UNAUTHENTICATED", "Authentication is required.", HttpStatus.UNAUTHORIZED);
    return this.service.bootstrapSupabase(token, parseInput(supabaseBootstrapSchema, body), request.requestId, ip);
  }
  @Get("me") @UseGuards(AuthGuard) me(@CurrentUser() user: AuthUser): Promise<AuthResult> { return this.service.me(user.id); }
}
