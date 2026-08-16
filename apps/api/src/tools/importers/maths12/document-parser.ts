import JSZip from 'jszip';
import { readFile } from 'node:fs/promises';
import { XMLParser } from 'fast-xml-parser';
import { attrsOf, childrenOf, deepText, findChild, findChildren, isTag, isText, tagOf, textValue, XmlNode } from './xml-utils';
import { convertOmmlNode } from './omml-to-latex';
import { convertBodyText } from './symbol-map';
import { ContentBlock, ParagraphNode } from './types';

export interface DocumentParseResult {
  paragraphs: ParagraphNode[];
  mathObjectsTotal: number;
  mathObjectsConverted: number;
  mathObjectsFailed: number;
  parsingErrors: string[];
}

export async function loadDocumentXml(docxPath: string): Promise<string> {
  const buffer = await readFile(docxPath);
  const zip = await JSZip.loadAsync(buffer);
  const entry = zip.file('word/document.xml');
  if (!entry) throw new Error('word/document.xml not found inside DOCX package');
  return entry.async('string');
}

export function parseDocumentXml(xml: string): DocumentParseResult {
  const parser = new XMLParser({
    preserveOrder: true,
    ignoreAttributes: false,
    attributeNamePrefix: '',
    trimValues: false,
  });
  const root: XmlNode[] = parser.parse(xml);
  const documentNode = findDeep(root, 'w:document');
  if (!documentNode) throw new Error('w:document root element not found');
  const bodyNode = findChild(childrenOf(documentNode), 'w:body');
  if (!bodyNode) throw new Error('w:body element not found');

  const paragraphs: ParagraphNode[] = [];
  let mathObjectsTotal = 0;
  let mathObjectsConverted = 0;
  let mathObjectsFailed = 0;
  const parsingErrors: string[] = [];

  const trackMath = (blocks: ContentBlock[]) => {
    for (const block of blocks) {
      if (block.type === 'math') {
        mathObjectsTotal += 1;
        if (block.latex.trim().length > 0) mathObjectsConverted += 1;
        else mathObjectsFailed += 1;
      }
    }
  };

  for (const child of childrenOf(bodyNode)) {
    const tag = tagOf(child);
    if (tag === 'w:p') {
      const para = parseParagraph(child, parsingErrors);
      trackMath(para.blocks);
      paragraphs.push(para);
    } else if (tag === 'w:tbl') {
      const table = parseTable(child, parsingErrors);
      const tableBlocks = table.flat(2);
      trackMath(tableBlocks);
      paragraphs.push({
        styleId: null,
        numId: null,
        ilvl: null,
        text: '',
        blocks: [],
        isTable: true,
        tableRows: table,
        leadingBold: false,
      });
    }
    // w:sectPr and other body-level metadata are intentionally skipped.
  }

  return { paragraphs, mathObjectsTotal, mathObjectsConverted, mathObjectsFailed, parsingErrors };
}

function findDeep(nodes: XmlNode[], tag: string): XmlNode | undefined {
  for (const node of nodes) {
    if (tagOf(node) === tag) return node;
    const found = findDeep(childrenOf(node), tag);
    if (found) return found;
  }
  return undefined;
}

function parseParagraph(pNode: XmlNode, parsingErrors: string[]): ParagraphNode {
  const children = childrenOf(pNode);
  const pPr = findChild(children, 'w:pPr');
  const pPrChildren = pPr ? childrenOf(pPr) : [];
  const pStyle = findChild(pPrChildren, 'w:pStyle');
  const styleId = pStyle ? (attrsOf(pStyle)['w:val'] ?? null) : null;
  const numPr = findChild(pPrChildren, 'w:numPr');
  let numId: string | null = null;
  let ilvl: number | null = null;
  if (numPr) {
    const numPrChildren = childrenOf(numPr);
    const numIdNode = findChild(numPrChildren, 'w:numId');
    const ilvlNode = findChild(numPrChildren, 'w:ilvl');
    numId = numIdNode ? (attrsOf(numIdNode)['w:val'] ?? null) : null;
    ilvl = ilvlNode ? Number(attrsOf(ilvlNode)['w:val'] ?? '0') : null;
  }

  const blocks: ContentBlock[] = [];
  let pendingText = '';
  let firstRunSeen = false;
  let leadingBold = false;

  const flushText = () => {
    if (pendingText.length > 0) {
      blocks.push({ type: 'text', value: pendingText });
      pendingText = '';
    }
  };

  for (const node of children) {
    const tag = tagOf(node);
    if (tag === 'w:r') {
      const runChildren = childrenOf(node);
      const rPr = findChild(runChildren, 'w:rPr');
      const isBold = !!(rPr && findChild(childrenOf(rPr), 'w:b'));
      if (!firstRunSeen) {
        firstRunSeen = true;
        leadingBold = isBold;
      }
      for (const runChild of runChildren) {
        const runTag = tagOf(runChild);
        if (runTag === 'w:t') {
          pendingText += convertBodyText(deepText(childrenOf(runChild)));
        } else if (runTag === 'w:br' || runTag === 'w:cr') {
          pendingText += '\n';
        } else if (runTag === 'w:tab') {
          pendingText += '\t';
        }
      }
    } else if (tag === 'm:oMath') {
      flushText();
      const result = convertOmmlNode(node);
      if (!result.ok) parsingErrors.push(`oMath conversion failed: ${result.error}`);
      blocks.push({ type: 'math', latex: result.latex, display: false });
    } else if (tag === 'm:oMathPara') {
      flushText();
      const result = convertOmmlNode(node);
      if (!result.ok) parsingErrors.push(`oMathPara conversion failed: ${result.error}`);
      blocks.push({ type: 'math', latex: result.latex, display: true });
    } else if (tag === 'w:hyperlink') {
      // Inline hyperlink runs: pull text content only.
      pendingText += convertBodyText(deepText(childrenOf(node)));
    }
    // w:proofErr, w:bookmarkStart/End, w:pPr already handled above are skipped.
  }
  flushText();

  const text = blocks
    .filter((b): b is Extract<ContentBlock, { type: 'text' }> => b.type === 'text')
    .map((b) => b.value)
    .join('')
    .trim();

  return { styleId, numId, ilvl, text, blocks, leadingBold };
}

function parseTable(tblNode: XmlNode, parsingErrors: string[]): ContentBlock[][][] {
  const rows: ContentBlock[][][] = [];
  for (const rowChild of findChildren(childrenOf(tblNode), 'w:tr')) {
    const cells: ContentBlock[][] = [];
    for (const cellChild of findChildren(childrenOf(rowChild), 'w:tc')) {
      const cellBlocks: ContentBlock[] = [];
      for (const cellPara of findChildren(childrenOf(cellChild), 'w:p')) {
        const para = parseParagraph(cellPara, parsingErrors);
        cellBlocks.push(...para.blocks);
      }
      cells.push(cellBlocks);
    }
    rows.push(cells);
  }
  return rows;
}
