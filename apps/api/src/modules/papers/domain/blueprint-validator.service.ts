import { Injectable } from "@nestjs/common";
import type { Candidate, GenerationSection, ValidationIssue, ValidationResult } from "./generation.types";

@Injectable()
export class BlueprintValidatorService {
  validate(totalMarks: number, sections: readonly GenerationSection[], candidates: readonly Candidate[] = []): ValidationResult {
    const errors: ValidationIssue[] = [];
    const warnings: ValidationIssue[] = [];
    const calculated = sections.reduce((sum, section) => sum + section.marksPerQuestion * section.questionCount, 0);
    if (calculated !== totalMarks) errors.push({ code: "MARK_TOTAL_MISMATCH", message: `Sections total ${calculated} marks, expected ${totalMarks}.`, required: totalMarks, available: calculated });
    for (const section of sections) {
      if (section.questionCount <= 0 || section.marksPerQuestion <= 0) errors.push({ code: "INVALID_SECTION", sectionId: section.id, message: "Question count and marks must be positive." });
      if (section.internalChoiceCount < 0 || section.internalChoiceCount > section.questionCount) errors.push({ code: "INTERNAL_CHOICE_INVALID", sectionId: section.id, message: "Internal-choice count cannot exceed question count." });
      for (const [name, value] of [["difficulty", section.difficultyDistribution], ["chapter", section.chapterDistribution]] as const) {
        if (value && typeof value === "object" && !Array.isArray(value)) {
          const total = Object.values(value).reduce((sum, entry) => sum + (typeof entry === "number" ? entry : 0), 0);
          if (name === "difficulty" && total !== 100) errors.push({ code: "INVALID_DIFFICULTY_DISTRIBUTION", sectionId: section.id, message: "Difficulty percentages must total 100." });
        }
      }
      if (candidates.length) {
        const available = candidates.filter((candidate) => candidate.questionType === section.questionType && candidate.marks === section.marksPerQuestion).length;
        const required = section.questionCount + section.internalChoiceCount;
        if (available < required) errors.push({ code: "INSUFFICIENT_QUESTION_POOL", sectionId: section.id, message: `${section.name} requires ${required} questions but only ${available} are available.`, required, available });
      }
    }
    return { valid: errors.length === 0, errors, warnings };
  }
}
