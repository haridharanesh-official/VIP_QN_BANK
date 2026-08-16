/**
 * Small helpers over fast-xml-parser's `preserveOrder: true` output shape:
 * every element is `{ [tagName]: XmlNode[], ':@'?: Record<string,string> }`
 * and text leaves are `{ '#text': string }`. Order between siblings is the
 * document order, which is what lets us keep text/equation interleaving intact.
 */
export type XmlNode = Record<string, unknown>;

export function tagOf(node: XmlNode): string {
  const key = Object.keys(node).find((k) => k !== ':@');
  if (!key) throw new Error('xml node has no tag key');
  return key;
}

export function childrenOf(node: XmlNode): XmlNode[] {
  const tag = tagOf(node);
  const value = node[tag];
  return Array.isArray(value) ? (value as XmlNode[]) : [];
}

export function attrsOf(node: XmlNode): Record<string, string> {
  return (node[':@'] as Record<string, string>) ?? {};
}

export function isTag(node: XmlNode, tag: string): boolean {
  return tagOf(node) === tag;
}

export function findChild(children: XmlNode[], tag: string): XmlNode | undefined {
  return children.find((c) => tagOf(c) === tag);
}

export function findChildren(children: XmlNode[], tag: string): XmlNode[] {
  return children.filter((c) => tagOf(c) === tag);
}

export function isText(node: XmlNode): boolean {
  return Object.prototype.hasOwnProperty.call(node, '#text');
}

export function textValue(node: XmlNode): string {
  const value = node['#text'];
  return typeof value === 'string' ? value : String(value ?? '');
}

/** Recursively concatenates every #text leaf beneath `children` (used for m:t / w:t runs). */
export function deepText(children: XmlNode[]): string {
  let out = '';
  for (const child of children) {
    if (isText(child)) {
      out += textValue(child);
    } else {
      out += deepText(childrenOf(child));
    }
  }
  return out;
}
