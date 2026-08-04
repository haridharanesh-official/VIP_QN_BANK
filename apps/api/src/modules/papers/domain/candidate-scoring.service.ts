import { Injectable } from "@nestjs/common";
import type { Candidate, GenerationSection } from "./generation.types";

@Injectable()
export class CandidateScoringService {
  score(candidate: Candidate, section: GenerationSection, seed: string): number {
    const distribution = this.record(section.difficultyDistribution);
    const difficulty = typeof distribution[candidate.difficulty] === "number" ? distribution[candidate.difficulty] / 100 : 0.33;
    const reuse = 1 / (1 + candidate.usageCount);
    const age = candidate.lastUsedAt ? Math.min(1, (Date.now() - candidate.lastUsedAt.getTime()) / (90 * 86400_000)) : 1;
    const source = candidate.isBookBack ? 0.08 : candidate.isPreviousYear ? 0.05 : 0;
    return difficulty * 3 + reuse + age * 0.5 + source + this.jitter(`${seed}:${candidate.id}`);
  }
  private record(value: unknown): Record<string, number> { if (!value || typeof value !== "object" || Array.isArray(value)) return {}; const output: Record<string, number> = {}; for (const key of Object.keys(value)) { const entry = Reflect.get(value, key); if (typeof entry === "number") output[key] = entry; } return output; }
  private jitter(value: string): number { let hash = 0; for (const character of value) hash = (hash * 31 + character.charCodeAt(0)) >>> 0; return (hash % 1000) / 1_000_000; }
}
