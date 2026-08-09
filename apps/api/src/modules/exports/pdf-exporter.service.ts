import { Injectable } from "@nestjs/common";

@Injectable()
export class PdfExporterService {
  generatePdfHtml(
    paperTitle: string,
    snapshotData: any,
    view: "QUESTION_PAPER" | "ANSWER_KEY" | "QUESTIONS_WITH_ANSWERS",
    setLabel: string = "Set A"
  ): string {
    const meta = snapshotData.metadata || {};
    const sections = snapshotData.sections || [];

    let sectionsHtml = "";
    for (const sec of sections) {
      let questionsHtml = "";
      for (const q of sec.questions || []) {
        let optionsHtml = "";
        if (q.options && Array.isArray(q.options) && view !== "ANSWER_KEY") {
          optionsHtml = `<ol type="A" class="options">${q.options
            .map((o: any) => `<li>${this.escapeHtml(o.text)}</li>`)
            .join("")}</ol>`;
        }

        let answerHtml = "";
        if (q.correctAnswer !== undefined && view !== "QUESTION_PAPER") {
          answerHtml = `<div class="answer"><strong>Answer:</strong> ${this.escapeHtml(
            String(q.correctAnswer)
          )}${q.solution ? `<br/><strong>Solution:</strong> ${this.escapeHtml(q.solution)}` : ""}</div>`;
        }

        questionsHtml += `
          <div className="paper-question" style="margin: 14px 0;">
            <div style="display:flex; justify-content:space-between;">
              <span><b>${q.order}.</b> ${q.questionText ? this.escapeHtml(q.questionText) : ""}</span>
              <em>[${q.marks} marks]</em>
            </div>
            ${optionsHtml}
            ${answerHtml}
          </div>
        `;
      }

      sectionsHtml += `
        <section style="margin-top: 20px;">
          <h3 style="text-align:center; border-bottom:1px solid #333; padding-bottom:4px;">${this.escapeHtml(
            sec.name
          )}</h3>
          ${questionsHtml}
        </section>
      `;
    }

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>${this.escapeHtml(paperTitle)}</title>
  <style>
    @page { size: A4; margin: 15mm; }
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 11pt; color: #111; line-height: 1.5; }
    .paper-heading { text-align: center; border-bottom: 2px solid #111; margin-bottom: 15px; padding-bottom: 10px; }
    .paper-heading h2 { margin: 0 0 8px 0; font-size: 16pt; }
    .paper-heading p { display: flex; justify-content: space-between; font-weight: bold; margin: 0; }
    .instructions { margin-bottom: 20px; padding-left: 20px; }
    .options { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 20px; margin-left: 20px; }
    .answer { background-color: #f0fdf4; border-left: 3px solid #046d35; padding: 6px 10px; margin-top: 6px; }
    footer { font-size: 8pt; color: #666; border-top: 1px solid #ddd; padding-top: 8px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="paper-heading">
    <h2>${this.escapeHtml(meta.title || paperTitle)} (${setLabel})</h2>
    <p>
      <span>Time: ${meta.durationMinutes || 60} mins</span>
      <span>Total: ${meta.totalMarks || 100} marks</span>
    </p>
  </div>
  <ol class="instructions">
    ${(meta.instructions || []).map((ins: string) => `<li>${this.escapeHtml(ins)}</li>`).join("")}
  </ol>
  ${sectionsHtml}
  <footer>
    Snapshot Version ${snapshotData.version || 1} · Algorithm ${meta.algorithmVersion || "v1.0"}
  </footer>
</body>
</html>`;
  }

  private escapeHtml(str: string): string {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
}
