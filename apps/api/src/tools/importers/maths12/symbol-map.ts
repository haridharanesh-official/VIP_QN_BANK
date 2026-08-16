/**
 * Maps Unicode characters that appear inside Word math runs (m:t) and
 * ordinary text runs (w:t) to LaTeX. Word's Cambria Math font encodes
 * many operators/relations as single Unicode code points rather than
 * markup, so this table is required for faithful LaTeX output.
 */
const SYMBOL_MAP: Record<string, string> = {
  '×': '\\times',
  '÷': '\\div',
  '−': '-',
  '≤': '\\leq',
  '≥': '\\geq',
  '≠': '\\neq',
  '≈': '\\approx',
  '≡': '\\equiv',
  '∞': '\\infty',
  '√': '\\sqrt',
  '∑': '\\sum',
  '∏': '\\prod',
  '∫': '\\int',
  '→': '\\to',
  '⇒': '\\Rightarrow',
  '⇔': '\\Leftrightarrow',
  '∅': '\\emptyset',
  '∈': '\\in',
  '∉': '\\notin',
  '⊂': '\\subset',
  '⊆': '\\subseteq',
  '∪': '\\cup',
  '∩': '\\cap',
  '°': '^{\\circ}',
  '′': "'",
  '″': "''",
  '±': '\\pm',
  '∥': '\\parallel',
  '⊥': '\\perp',
  'Δ': '\\Delta',
  'α': '\\alpha',
  'β': '\\beta',
  'γ': '\\gamma',
  'Γ': '\\Gamma',
  'δ': '\\delta',
  'ε': '\\varepsilon',
  'θ': '\\theta',
  'λ': '\\lambda',
  'μ': '\\mu',
  'π': '\\pi',
  'ρ': '\\rho',
  'σ': '\\sigma',
  'Σ': '\\Sigma',
  'φ': '\\phi',
  'Φ': '\\Phi',
  'ω': '\\omega',
  'Ω': '\\Omega',
  '…': '\\ldots',
  '¬': '\\neg',
  '∧': '\\wedge',
  '∨': '\\vee',
  '∀': '\\forall',
  '∃': '\\exists',
  '⋅': '\\cdot',
  '·': '\\cdot',
  '⋯': '\\cdots',
  '↔': '\\leftrightarrow',
  '∴': '\\therefore',
  '∵': '\\because',
  '∘': '\\circ',
  '​': '', // zero-width space: Word placeholder artifact, not real content
  '∂': '\\partial',
  '∠': '\\angle',
  '∖': '\\setminus',
  '∼': '\\sim',
  '⊙': '\\odot',
  'ϕ': '\\phi',
};

const FUNCTION_NAMES = new Set([
  'sin',
  'cos',
  'tan',
  'cot',
  'sec',
  'cosec',
  'csc',
  'sinh',
  'cosh',
  'tanh',
  'log',
  'ln',
  'lim',
  'exp',
  'max',
  'min',
  'det',
  'arg',
]);

const BARE_LETTER_MACRO = /^\\[a-zA-Z]+$/;

/** Converts literal math-run text (already known to be non-italic identifiers/numbers/operators) to LaTeX. */
export function convertMathText(raw: string): string {
  let out = '';
  for (const ch of raw) {
    const mapped = SYMBOL_MAP[ch];
    if (mapped === undefined) {
      out += ch;
      continue;
    }
    out += mapped;
    // A word-only substitution (e.g. ∈ -> \in) must never be left directly adjacent to the next
    // character, because concatenation happens across separate Word runs/oMath nodes — by the
    // time any later pass sees the joined string, "\in" + "Z" is indistinguishable from an
    // intentional "\inZ" macro name. Adding the space at substitution time, unconditionally, is
    // the only place the boundary is still known; a trailing space after a control word is
    // always LaTeX-safe even when nothing follows it.
    if (BARE_LETTER_MACRO.test(mapped)) out += ' ';
  }
  if (FUNCTION_NAMES.has(out.trim())) {
    return `\\${out.trim()} `;
  }
  return out;
}

/** Converts ordinary body text (outside math regions) preserving readable Unicode where LaTeX escaping isn't needed. */
export function convertBodyText(raw: string): string {
  let out = '';
  for (const ch of raw) {
    out += SYMBOL_MAP[ch] ?? ch;
  }
  return out;
}

export function escapeLatexSpecials(raw: string): string {
  return raw.replace(/([%&_#{}])/g, '\\$1');
}
