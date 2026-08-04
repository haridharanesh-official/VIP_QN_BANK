import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { AuditService } from "../audit/audit.service";
import { QuestionsController } from "./questions.controller";
import { QuestionsService } from "./questions.service";
@Module({ imports: [AuthModule], controllers: [QuestionsController], providers: [QuestionsService, AuditService] }) export class QuestionsModule {}
