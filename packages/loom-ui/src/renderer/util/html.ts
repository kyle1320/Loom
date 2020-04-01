import { Value } from 'loom-data';
import * as loom from 'loom-core';

import C from './constants';

type Tagged = { tag: Value<string> };

export function isElement(node: Node): node is Element {
  return node.nodeType === 1;
}

export function validChildren(node: Tagged): Readonly<string[]> | null {
  const tag = node.tag.get();

  if (isEmptyElement(node)) return [];

  switch (tag) {
    case 'head': return C.html.metadata;
    case 'title':
    case 'script':
    case 'style': return [];
    case 'table': return [
      'caption', 'colgroup', 'thead', 'tbody', 'tr', 'tfoot'
    ];
    case 'thead':
    case 'tbody': return ['tr'];
    case 'tr': return ['td', 'th'];
    case 'ul':
    case 'ol': return ['li'];
    default: return null;
  }
}

export function validTags(element: loom.ElementDef): Readonly<string[]> {
  const parent = element.parent();
  return parent && validChildren(parent) || C.html.basicTags;
}

export function isEmptyElement({ tag: tagVal }: Tagged): boolean {
  switch (tagVal.get()) {
    case 'area':
    case 'base':
    case 'br':
    case 'col':
    case 'embed':
    case 'hr':
    case 'img':
    case 'input':
    case 'link':
    case 'meta':
    case 'param':
    case 'source':
    case 'track':
    case 'wbr': return true;
    default: return false;
  }
}

export function isValidChild(
  parent: Tagged,
  child: loom.Element | loom.Component | loom.TextNode |
  loom.UnknownComponent | loom.ElementDef
): boolean {
  const valid = validChildren(parent);
  if (child instanceof loom.TextNode) return supportsText(parent);
  if (child instanceof loom.Component) child = child.element.get();
  if (child instanceof loom.UnknownComponent) return isEmptyElement(parent);
  return valid ? valid.indexOf(child.tag.get()) >= 0 : true;
}

export function supportsText(el: Tagged): boolean {
  if (isEmptyElement(el)) return false;

  switch (el.tag.get()) {
    case 'head':
    case 'table':
    case 'thead':
    case 'tbody':
    case 'tr':
    case 'ul':
    case 'ol': return false;
    default: return true;
  }
}

export function getElementName(tag: string): string | undefined {
  switch (tag) {
    case 'a': return 'Link';
    case 'b': return 'Bold';
    case 'i': return 'Italic';
    case 's': return 'Strikethrough';
    case 'p': return 'Paragraph';
    case 'u': return 'Underline';
    case 'h1':
    case 'h2':
    case 'h3':
    case 'h4':
    case 'h5':
    case 'h6': return 'Heading';
    case 'hr': return 'Horizontal Rule';
    case 'ol': return 'Ordered List';
    case 'ul': return 'Unordered List';
    case 'sub': return 'Subscript';
    case 'sup': return 'Superscript';
    case 'table': return 'Table';
    case 'thead': return 'Table Head';
    case 'tbody': return 'Table Body';
    case 'tfoot': return 'Table Footer';
    case 'tr': return 'Table Row';
    case 'td': return 'Table Data Cell';
    case 'th': return 'Table Header Cell';
    case 'div': return 'Generic Block Container';
    case 'span': return 'Generic Inline Container';
    case 'base': return 'Base URL Specifier';
    case 'link': return 'External Resource Link';
    case 'meta': return 'Generic Metadata';
    case 'script': return 'Script';
    case 'style': return 'Inline Stylesheet';
    case 'title': return 'Document Title';
    default: return undefined;
  }
}