export const CANONICAL_CHAPTERS: Array<{ number: number; title: string }> = [
  { number: 1, title: 'Applications of Matrices and Determinants' },
  { number: 2, title: 'Complex Numbers' },
  { number: 3, title: 'Theory of Equations' },
  { number: 4, title: 'Inverse Trigonometric Functions' },
  { number: 5, title: 'Two Dimensional Analytical Geometry-II' },
  { number: 6, title: 'Applications of Vector Algebra' },
  { number: 7, title: 'Applications of Differential Calculus' },
  { number: 8, title: 'Differentials and Partial Derivatives' },
  { number: 9, title: 'Applications of Integration' },
  { number: 10, title: 'Ordinary Differential Equations' },
  { number: 11, title: 'Probability Distributions' },
  { number: 12, title: 'Discrete Mathematics' },
];

export function normalizeTitle(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}
