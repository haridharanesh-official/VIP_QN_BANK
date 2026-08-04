import { Injectable } from "@nestjs/common";
import { CandidateScoringService } from "./candidate-scoring.service";
import type { Candidate, GenerationSection, Selection } from "./generation.types";

@Injectable()
export class PaperGeneratorService {
  constructor(private readonly scoring: CandidateScoringService) {}
  generate(sections: readonly GenerationSection[], candidates: readonly Candidate[], seed: string): readonly Selection[] {
    const used = new Set<string>();
    return [...sections].sort((a, b) => a.displayOrder - b.displayOrder).map((section) => {
      const count = section.questionCount + section.internalChoiceCount;
      const questions = candidates.filter((candidate) => !used.has(candidate.id) && candidate.questionType === section.questionType && candidate.marks === section.marksPerQuestion).sort((a, b) => this.scoring.score(b, section, seed) - this.scoring.score(a, section, seed)).slice(0, count);
      for (const question of questions) used.add(question.id);
      return { section, questions };
    });
  }
}
