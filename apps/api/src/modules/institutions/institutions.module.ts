import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { InstitutionsController } from "./institutions.controller";
@Module({ imports: [AuthModule], controllers: [InstitutionsController] }) export class InstitutionsModule {}
