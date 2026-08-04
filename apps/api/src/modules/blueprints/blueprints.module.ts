import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { BlueprintValidatorService } from "../papers/domain/blueprint-validator.service";
import { CandidateScoringService } from "../papers/domain/candidate-scoring.service";
import { PaperGeneratorService } from "../papers/domain/paper-generator.service";
import { BlueprintsController } from "./blueprints.controller";
import { BlueprintsService } from "./blueprints.service";
@Module({ imports: [AuthModule], controllers: [BlueprintsController], providers: [BlueprintsService, BlueprintValidatorService, CandidateScoringService, PaperGeneratorService] }) export class BlueprintsModule {}
