function difficultyWeight(question, target) {
  const desired = target[question.difficulty] ?? 0;
  return desired / 100;
}

function stableJitter(questionId) {
  let hash = 0;
  for (const character of questionId) hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  return (hash % 100) / 10000;
}

export function generatePaper(questionBank, payload) {
  const chapters = Array.isArray(payload.chapters) ? payload.chapters : [];
  const sections = Array.isArray(payload.sections) ? payload.sections : [];
  const difficulty = payload.difficulty ?? { EASY: 30, MEDIUM: 50, HARD: 20 };
  const difficultyTotal = Object.values(difficulty).reduce((sum, value) => sum + Number(value), 0);

  if (chapters.length === 0) {
    return { success: false, code: "NO_CHAPTERS", message: "Select at least one chapter." };
  }
  if (sections.length === 0) {
    return { success: false, code: "NO_SECTIONS", message: "Add at least one paper section." };
  }
  if (difficultyTotal !== 100) {
    return { success: false, code: "INVALID_DIFFICULTY", message: "Difficulty percentages must total 100." };
  }

  const excluded = new Set(Array.isArray(payload.excludedQuestionIds) ? payload.excludedQuestionIds : []);
  const selected = [];
  const deficits = [];

  for (const section of sections) {
    const count = Number(section.count);
    const marksPerQuestion = Number(section.marksPerQuestion);
    if (!Number.isInteger(count) || count <= 0 || !Number.isInteger(marksPerQuestion) || marksPerQuestion <= 0) {
      return { success: false, code: "INVALID_SECTION", message: `${section.name ?? "A section"} has invalid marks or question count.` };
    }

    const candidates = questionBank
      .filter((question) => chapters.includes(question.chapter))
      .filter((question) => question.type === section.type)
      .filter((question) => question.marks === marksPerQuestion)
      .filter((question) => !excluded.has(question.id) && !selected.some((entry) => entry.id === question.id))
      .map((question) => ({
        ...question,
        score:
          difficultyWeight(question, difficulty) +
          (question.source === "BOOK_BACK" ? 0.08 : 0) +
          (question.source === "PREVIOUS_YEAR" ? 0.05 : 0) +
          stableJitter(question.id),
      }))
      .sort((a, b) => b.score - a.score);

    if (candidates.length < count) {
      deficits.push({ section: section.name, required: count, available: candidates.length });
      continue;
    }

    selected.push(
      ...candidates.slice(0, count).map(({ score: _score, ...question }) => ({
        ...question,
        section: section.name,
      })),
    );
  }

  const expectedMarks = sections.reduce(
    (sum, section) => sum + Number(section.marksPerQuestion) * Number(section.count),
    0,
  );
  const actualMarks = selected.reduce((sum, question) => sum + question.marks, 0);

  if (deficits.length > 0 || actualMarks !== expectedMarks) {
    return { success: false, code: "INSUFFICIENT_POOL", deficits, expectedMarks, actualMarks };
  }

  return {
    success: true,
    paper: {
      name: payload.name ?? "Generated Paper",
      institution: payload.institution ?? "VIP Maths Demonstration School",
      board: "Tamil Nadu State Board",
      standard: "Class 10",
      subject: "Mathematics",
      durationMinutes: Number(payload.durationMinutes ?? 90),
      totalMarks: actualMarks,
      questions: selected,
    },
    metadata: {
      algorithmVersion: "prototype-0.2",
      generatedAt: new Date().toISOString(),
      chapters,
      difficulty,
    },
  };
}
