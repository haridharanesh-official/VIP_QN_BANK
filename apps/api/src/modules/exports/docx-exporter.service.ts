import { Injectable } from "@nestjs/common";

@Injectable()
export class DocxExporterService {
  generateDocxContent(
    paperTitle: string,
    snapshotData: any,
    view: "QUESTION_PAPER" | "ANSWER_KEY" | "QUESTIONS_WITH_ANSWERS",
    setLabel: string = "Set A"
  ): string {
    const meta = snapshotData.metadata || {};
    const sections = snapshotData.sections || [];

    let textContent = `${meta.title || paperTitle} (${setLabel})\n`;
    textContent += `Time: ${meta.durationMinutes || 60} mins | Total: ${meta.totalMarks || 100} marks\n\n`;

    textContent += `INSTRUCTIONS:\n`;
    (meta.instructions || []).forEach((ins: string, idx: number) => {
      textContent += `${idx + 1}. ${ins}\n`;
    });
    textContent += `\n`;

    for (const sec of sections) {
      textContent += `--- ${sec.name.toUpperCase()} ---\n\n`;
      for (const q of sec.questions || []) {
        if (view !== "ANSWER_KEY") {
          textContent += `${q.order}. ${q.questionText || ""} [${q.marks} marks]\n`;
          if (q.options && Array.isArray(q.options)) {
            q.options.forEach((opt: any) => {
              textContent += `   ${opt.id}) ${opt.text}\n`;
            });
          }
        }
        if (view !== "QUESTION_PAPER" && q.correctAnswer !== undefined) {
          textContent += `   ANSWER: ${q.correctAnswer}\n`;
          if (q.solution) {
            textContent += `   SOLUTION: ${q.solution}\n`;
          }
        }
        textContent += `\n`;
      }
    }

    return textContent;
  }
}
