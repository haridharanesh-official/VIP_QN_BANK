import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { PapersController } from "./papers.controller";
@Module({ imports: [AuthModule], controllers: [PapersController] }) export class PapersModule {}
