import { Module } from "@nestjs/common";
import { HealthController } from "./health.controller";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./modules/auth/auth.module";
import { AcademicModule } from "./modules/academic/academic.module";
import { QuestionsModule } from "./modules/questions/questions.module";
import { BlueprintsModule } from "./modules/blueprints/blueprints.module";
import { PapersModule } from "./modules/papers/papers.module";
import { InstitutionsModule } from "./modules/institutions/institutions.module";
import { RuntimeServicesService } from "./runtime-services.service";

@Module({ imports: [PrismaModule, AuthModule, InstitutionsModule, AcademicModule, QuestionsModule, BlueprintsModule, PapersModule], controllers: [HealthController], providers: [RuntimeServicesService] })
export class AppModule {}
