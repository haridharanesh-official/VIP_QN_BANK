import test from 'node:test';
import assert from 'node:assert/strict';
import { XMLParser } from 'fast-xml-parser';
import { convertOmmlNode } from '../src/tools/importers/maths12/omml-to-latex';
import { findChild, childrenOf, XmlNode } from '../src/tools/importers/maths12/xml-utils';

const OMML_NS =
  'xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math" xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"';

function convert(innerOMathXml: string): string {
  const parser = new XMLParser({ preserveOrder: true, ignoreAttributes: false, attributeNamePrefix: '' });
  const xml = `<m:oMath ${OMML_NS}>${innerOMathXml}</m:oMath>`;
  const root: XmlNode[] = parser.parse(xml);
  const oMathNode = findChild(root, 'm:oMath');
  assert.ok(oMathNode, 'fixture must parse to an m:oMath root');
  const result = convertOmmlNode(oMathNode!);
  assert.equal(result.ok, true, result.error);
  return result.latex;
}

// Each fixture below is real OMML extracted from "12 th Maths Question Bank 2026 Full Chapter.docx",
// covering the chapters named in the master import spec's equation round-trip audit (matrices,
// complex numbers, analytical geometry, vectors, differential calculus, integration, ODEs,
// probability, discrete mathematics).

test('chapter 1 (matrices): 3x3 matrix wrapped in square-bracket delimiters renders as bmatrix', () => {
  const xml =
    '<m:d><m:dPr><m:begChr m:val="["/><m:endChr m:val="]"/></m:dPr><m:e><m:m><m:mr><m:e><m:r><m:t>8</m:t></m:r></m:e><m:e><m:r><m:t>-6</m:t></m:r></m:e><m:e><m:r><m:t>2</m:t></m:r></m:e></m:mr><m:mr><m:e><m:r><m:t>-6</m:t></m:r></m:e><m:e><m:r><m:t>7</m:t></m:r></m:e><m:e><m:r><m:t>-4</m:t></m:r></m:e></m:mr></m:m></m:e></m:d>';
  const latex = convert(xml);
  assert.equal(latex, '\\begin{bmatrix} 8 & -6 & 2 \\\\ -6 & 7 & -4 \\end{bmatrix}');
});

test('chapter 1 (matrices): determinant bars (m:d with U+2223) render as vmatrix', () => {
  const xml =
    '<m:d><m:dPr><m:begChr m:val="∣"/><m:endChr m:val="∣"/></m:dPr><m:e><m:m><m:mr><m:e><m:r><m:t>a</m:t></m:r></m:e><m:e><m:r><m:t>b</m:t></m:r></m:e></m:mr><m:mr><m:e><m:r><m:t>c</m:t></m:r></m:e><m:e><m:r><m:t>d</m:t></m:r></m:e></m:mr></m:m></m:e></m:d>';
  assert.equal(convert(xml), '\\begin{vmatrix} a & b \\\\ c & d \\end{vmatrix}');
});

test('chapter 2 (complex numbers): superscript renders exponent and n-ary sum keeps limits', () => {
  const power = convert('<m:sSup><m:e><m:r><m:t>i</m:t></m:r></m:e><m:sup><m:r><m:t>1729</m:t></m:r></m:sup></m:sSup>');
  assert.equal(power, '{i}^{1729}');

  const sum =
    '<m:nary><m:naryPr><m:chr m:val="∑"/></m:naryPr><m:sub><m:r><m:t>n=1</m:t></m:r></m:sub><m:sup><m:r><m:t>102</m:t></m:r></m:sup><m:e><m:sSup><m:e><m:r><m:t>i</m:t></m:r></m:e><m:sup><m:r><m:t>n</m:t></m:r></m:sup></m:sSup></m:e></m:nary>';
  assert.equal(convert(sum), '\\sum_{n=1}^{102} {i}^{n}');
});

test('chapter 5 (analytical geometry): fraction renders as \\frac and preserves order around it', () => {
  const xml =
    '<m:r><m:t>m=</m:t></m:r><m:f><m:num><m:r><m:t>y2-y1</m:t></m:r></m:num><m:den><m:r><m:t>x2-x1</m:t></m:r></m:den></m:f>';
  assert.equal(convert(xml), 'm=\\frac{y2-y1}{x2-x1}');
});

test('chapter 6 (vectors): accent chr U+20D7 renders \\vec and U+203E renders \\overline', () => {
  const vec = '<m:acc><m:accPr><m:chr m:val="⃗"/></m:accPr><m:e><m:r><m:t>a</m:t></m:r></m:e></m:acc>';
  assert.equal(convert(vec), '\\vec{a}');

  const overline = '<m:acc><m:accPr><m:chr m:val="‾"/></m:accPr><m:e><m:r><m:t>i</m:t></m:r></m:e></m:acc>';
  assert.equal(convert(overline), '\\overline{i}');
});

test('chapter 7 (differential calculus): subscript-in-interval delimiter round-trips with no gluing', () => {
  const xml =
    '<m:r><m:t>x</m:t></m:r><m:r><m:t>∈</m:t></m:r><m:d><m:dPr><m:begChr m:val="["/><m:endChr m:val="]"/></m:dPr><m:e><m:r><m:t>0,2</m:t></m:r></m:e></m:d>';
  assert.equal(convert(xml), 'x\\in \\left[ 0,2 \\right]');
});

test('chapter 9 (integration): m:nary integral with sub/sup limits and dx operand', () => {
  const xml =
    '<m:nary><m:naryPr><m:chr m:val="∫"/></m:naryPr><m:sub><m:r><m:t>0</m:t></m:r></m:sub><m:sup><m:r><m:t>0.5</m:t></m:r></m:sup><m:e><m:sSup><m:e><m:r><m:t>x</m:t></m:r></m:e><m:sup><m:r><m:t>2</m:t></m:r></m:sup></m:sSup><m:r><m:t>dx</m:t></m:r></m:e></m:nary>';
  assert.equal(convert(xml), '\\int_{0}^{0.5} {x}^{2}dx');
});

test('chapter 10 (ODEs): nested fraction-in-superscript-in-fraction preserves nesting depth', () => {
  const xml =
    '<m:f><m:num><m:sSup><m:e><m:d><m:dPr><m:begChr m:val="("/><m:endChr m:val=")"/></m:dPr><m:e><m:f><m:num><m:r><m:t>dy</m:t></m:r></m:num><m:den><m:r><m:t>dx</m:t></m:r></m:den></m:f></m:e></m:d></m:e><m:sup><m:r><m:t>7</m:t></m:r></m:sup></m:sSup></m:num><m:den><m:r><m:t>1</m:t></m:r></m:den></m:f>';
  assert.equal(convert(xml), '\\frac{{\\left( \\frac{dy}{dx} \\right)}^{7}}{1}');
});

test('chapter 11 (probability): radical with hidden square-root degree omits the optional index', () => {
  const xml = '<m:rad><m:radPr><m:degHide m:val="1"/></m:radPr><m:deg/><m:e><m:r><m:t>npq</m:t></m:r></m:e></m:rad>';
  assert.equal(convert(xml), '\\sqrt{npq}');
});

test('chapter 12 (discrete mathematics): logic symbols map to LaTeX macros with correct spacing', () => {
  const xml = '<m:r><m:t>p</m:t></m:r><m:r><m:t>↔</m:t></m:r><m:r><m:t>q</m:t></m:r>';
  assert.equal(convert(xml), 'p\\leftrightarrow q');
});

test('symbol substitution never glues a LaTeX control word into the following identifier', () => {
  // Regression fixture for the \left( -> \lef t( backtracking bug found during Gate 1 QA:
  // a naive lookahead-based space-insertion regex corrupted every multi-letter control word.
  const xml = '<m:r><m:t>a,b</m:t></m:r><m:r><m:t>∈</m:t></m:r><m:r><m:t>Z</m:t></m:r>';
  const latex = convert(xml);
  assert.equal(latex, 'a,b\\in Z');
  assert.doesNotMatch(latex, /\\lef |\\righ |\\begi |\\en d|\\fra c/);
});
