import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { AuthGuard, InstitutionGuard, LegacyAuthGuard, RolesGuard, SupabaseAuthGuard } from "./auth.guards";
import { SupabaseJwtVerifier } from "./supabase-jwt-verifier";
@Module({ imports: [JwtModule.register({})], controllers: [AuthController], providers: [AuthService, SupabaseJwtVerifier, LegacyAuthGuard, SupabaseAuthGuard, AuthGuard, InstitutionGuard, RolesGuard], exports: [SupabaseJwtVerifier, LegacyAuthGuard, SupabaseAuthGuard, AuthGuard, InstitutionGuard, RolesGuard, JwtModule] }) export class AuthModule {}
