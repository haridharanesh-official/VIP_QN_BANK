import { attrsOf, childrenOf, findChild, findChildren, isTag, tagOf, XmlNode } from './xml-utils';
import { convertMathText } from './symbol-map';

const NARY_CHR_LATEX: Record<string, string> = {
  '∫': '\\int',
  '∬': '\\iint',
  '∭': '\\iiint',
  '∮': '\\oint',
  '∑': '\\sum',
  '∏': '\\prod',
  '⋂': '\\bigcap',
  '⋃': '\\bigcup',
};

const ACCENT_CHR_LATEX: Record<string, (base: string) => string> = {
  '¯': (base) => `\\overline{${base}}`,
  '‾': (base) => `\\overline{${base}}`, // U+203E, Word's usual "overline" accent char
  '→': (base) => `\\vec{${base}}`,
  '⃗': (base) => `\\vec{${base}}`, // U+20D7 combining right arrow above, Word's usual "vector" accent char
  '^': (base) => `\\hat{${base}}`,
  '~': (base) => `\\tilde{${base}}`,
  '.': (base) => `\\dot{${base}}`,
};

export interface OmmlConversionResult {
  latex: string;
  ok: boolean;
  error?: string;
}

/** Converts a single `m:oMath` or `m:oMathPara` XmlNode into a LaTeX string. */
export function convertOmmlNode(node: XmlNode): OmmlConversionResult {
  try {
    const tag = tagOf(node);
    if (tag === 'm:oMathPara') {
      const rows = findChildren(childrenOf(node), 'm:oMath').map((n) => convertSequence(childrenOf(n)));
      return { latex: normalizeSpacing(rows.join(' \\\\ ')), ok: true };
    }
    if (tag === 'm:oMath') {
      return { latex: normalizeSpacing(convertSequence(childrenOf(node))), ok: true };
    }
    return { latex: '', ok: false, error: `unexpected root tag ${tag}` };
  } catch (err) {
    return { latex: '', ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

function convertSequence(nodes: XmlNode[]): string {
  const parts: string[] = [];
  for (const node of nodes) {
    const piece = convertOne(node);
    if (piece !== null) parts.push(piece);
  }
  return joinParts(parts);
}

function joinParts(parts: string[]): string {
  return parts.join('').replace(/\s+/g, ' ').trim();
}

/** Converts an `m:e`-style argument wrapper (or any node whose children form a sequence) to LaTeX. */
function convertArg(node: XmlNode | undefined): string {
  if (!node) return '';
  return convertSequence(childrenOf(node));
}

function convertOne(node: XmlNode): string | null {
  const tag = tagOf(node);
  const children = childrenOf(node);

  switch (tag) {
    case 'm:r':
      return convertRun(node);
    case 'm:f':
      return convertFraction(children);
    case 'm:sSup':
      return convertSup(children);
    case 'm:sSub':
      return convertSub(children);
    case 'm:sSubSup':
      return convertSubSup(children);
    case 'm:rad':
      return convertRadical(children);
    case 'm:d':
      return convertDelimiter(node);
    case 'm:nary':
      return convertNary(children);
    case 'm:m':
      return convertMatrix(node, null, null);
    case 'm:acc':
      return convertAccent(children);
    case 'm:bar':
      return convertBar(children);
    case 'm:e':
      return convertSequence(children);
    case 'm:ctrlPr':
    case 'm:rPr':
    case 'm:fPr':
    case 'm:radPr':
    case 'm:naryPr':
    case 'm:dPr':
    case 'm:mPr':
    case 'm:sSupPr':
    case 'm:sSubPr':
    case 'm:sSubSupPr':
    case 'm:accPr':
    case 'm:barPr':
      return null; // formatting-only property groups, not content
    default:
      // Unknown construct: fall back to any nested runs so we never silently drop text.
      return convertSequence(children);
  }
}

function convertRun(runNode: XmlNode): string {
  const children = childrenOf(runNode);
  const tNode = findChild(children, 'm:t');
  if (!tNode) return '';
  const raw = childrenOf(tNode)
    .filter((c) => Object.prototype.hasOwnProperty.call(c, '#text'))
    .map((c) => (c as Record<string, string>)['#text'])
    .join('');
  return convertMathText(raw);
}

function convertFraction(children: XmlNode[]): string {
  const num = findChild(children, 'm:num');
  const den = findChild(children, 'm:den');
  return `\\frac{${convertArg(num)}}{${convertArg(den)}}`;
}

function convertSup(children: XmlNode[]): string {
  const es = findChildren(children, 'm:e');
  const sup = findChild(children, 'm:sup');
  const base = es[0];
  return `{${convertArg(base)}}^{${convertArg(sup)}}`;
}

function convertSub(children: XmlNode[]): string {
  const es = findChildren(children, 'm:e');
  const sub = findChild(children, 'm:sub');
  const base = es[0];
  return `{${convertArg(base)}}_{${convertArg(sub)}}`;
}

function convertSubSup(children: XmlNode[]): string {
  const es = findChildren(children, 'm:e');
  const sub = findChild(children, 'm:sub');
  const sup = findChild(children, 'm:sup');
  const base = es[0];
  return `{${convertArg(base)}}_{${convertArg(sub)}}^{${convertArg(sup)}}`;
}

function convertRadical(children: XmlNode[]): string {
  const radPr = findChild(children, 'm:radPr');
  const degHidden = radPr ? attrsOf(findChild(childrenOf(radPr), 'm:degHide') ?? {})['m:val'] === '1' : false;
  const deg = findChild(children, 'm:deg');
  const e = findChild(children, 'm:e');
  const degLatex = deg ? convertArg(deg) : '';
  if (degLatex && !degHidden) {
    return `\\sqrt[${degLatex}]{${convertArg(e)}}`;
  }
  return `\\sqrt{${convertArg(e)}}`;
}

function convertDelimiter(node: XmlNode): string {
  const children = childrenOf(node);
  const dPr = findChild(children, 'm:dPr');
  const dPrChildren = dPr ? childrenOf(dPr) : [];
  const begChr = findChild(dPrChildren, 'm:begChr');
  const endChr = findChild(dPrChildren, 'm:endChr');
  const beg = begChr ? (attrsOf(begChr)['m:val'] ?? '(') : '(';
  const end = endChr ? (attrsOf(endChr)['m:val'] ?? ')') : ')';
  const args = findChildren(children, 'm:e');

  // A single matrix argument wrapped in [ ] or ( ) should render as a
  // bracketed matrix environment instead of \left[ \begin{matrix} ... \right].
  if (args.length === 1) {
    const argChildren = childrenOf(args[0]);
    const onlyChild = argChildren.length === 1 ? argChildren[0] : undefined;
    if (onlyChild && isTag(onlyChild, 'm:m')) {
      return convertMatrix(onlyChild, beg, end);
    }
  }

  const inner = args.map((a) => convertArg(a)).join(', ');
  const leftDelim = LATEX_DELIM[beg] ?? beg;
  const rightDelim = LATEX_DELIM[end] ?? end;
  return `\\left${leftDelim} ${inner} \\right${rightDelim}`;
}

const LATEX_DELIM: Record<string, string> = {
  '(': '(',
  ')': ')',
  '[': '[',
  ']': ']',
  '{': '\\{',
  '}': '\\}',
  '|': '|',
  '∣': '|', // U+2223 DIVIDES, Word's usual glyph for absolute-value/determinant bars
  '': '.',
};

function convertNary(children: XmlNode[]): string {
  const naryPr = findChild(children, 'm:naryPr');
  const naryPrChildren = naryPr ? childrenOf(naryPr) : [];
  const chrNode = findChild(naryPrChildren, 'm:chr');
  const chr = chrNode ? (attrsOf(chrNode)['m:val'] ?? '∫') : '∫';
  const opLatex = NARY_CHR_LATEX[chr] ?? chr;
  const sub = findChild(children, 'm:sub');
  const sup = findChild(children, 'm:sup');
  const e = findChild(children, 'm:e');

  let op = opLatex;
  if (sub) op += `_{${convertArg(sub)}}`;
  if (sup) op += `^{${convertArg(sup)}}`;
  const operand = convertArg(e);
  return `${op} ${operand}`;
}

function convertMatrix(matrixNode: XmlNode, beg: string | null, end: string | null): string {
  const children = childrenOf(matrixNode);
  const rows = findChildren(children, 'm:mr');
  const body = rows
    .map((row) => findChildren(childrenOf(row), 'm:e').map((cell) => convertArg(cell)).join(' & '))
    .join(' \\\\ ');

  const envFor: Record<string, string> = { '[': 'bmatrix', '(': 'pmatrix', '|': 'vmatrix', '∣': 'vmatrix', '{': 'Bmatrix' };
  if (beg && envFor[beg]) {
    const env = envFor[beg];
    return `\\begin{${env}} ${body} \\end{${env}}`;
  }
  if (beg || end) {
    const leftDelim = beg ? (LATEX_DELIM[beg] ?? beg) : '.';
    const rightDelim = end ? (LATEX_DELIM[end] ?? end) : '.';
    return `\\left${leftDelim} \\begin{matrix} ${body} \\end{matrix} \\right${rightDelim}`;
  }
  return `\\begin{matrix} ${body} \\end{matrix}`;
}

function convertAccent(children: XmlNode[]): string {
  const accPr = findChild(children, 'm:accPr');
  const accPrChildren = accPr ? childrenOf(accPr) : [];
  const chrNode = findChild(accPrChildren, 'm:chr');
  const chr = chrNode ? (attrsOf(chrNode)['m:val'] ?? '¯') : '¯';
  const e = findChild(children, 'm:e');
  const base = convertArg(e);
  const fn = ACCENT_CHR_LATEX[chr];
  return fn ? fn(base) : `\\overset{${chr}}{${base}}`;
}

function convertBar(children: XmlNode[]): string {
  const barPr = findChild(children, 'm:barPr');
  const barPrChildren = barPr ? childrenOf(barPr) : [];
  const posNode = findChild(barPrChildren, 'm:pos');
  const pos = posNode ? attrsOf(posNode)['m:val'] : 'top';
  const e = findChild(children, 'm:e');
  const base = convertArg(e);
  return pos === 'bot' ? `\\underline{${base}}` : `\\overline{${base}}`;
}

/**
 * Word math text is concatenated without spaces (e.g. "a,b∈Z"), so a
 * Unicode-to-LaTeX substitution like ∈ → \in can end up glued to the next
 * letter ("\inZ"), which LaTeX parses as one undefined control word. Insert
 * a separating space after any control word immediately followed by a letter.
 */
function normalizeSpacing(latex: string): string {
  // Deliberately not a lookahead-based regex: `\\[a-zA-Z]+(?=[a-zA-Z])` backtracks
  // the greedy `+` down to whatever shorter prefix satisfies the lookahead
  // (e.g. turning "\left(" into "\lef" + "t(" because "t" is a letter), which
  // silently corrupts otherwise-correct control words. Matching the control
  // word alone (no assertion, so no backtracking) and inspecting the next
  // character manually avoids that.
  return latex.replace(/\\[a-zA-Z]+/g, (match, offset: number, full: string) => {
    const nextChar = full[offset + match.length];
    return nextChar && /[a-zA-Z]/.test(nextChar) ? `${match} ` : match;
  });
}
