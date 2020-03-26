import { Value } from 'loom-data';
import { ElementDef } from 'loom-core';

import C from './constants';

type Tagged = { tag: Value<string> };

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

export function validTags(element: ElementDef): Readonly<string[]> {
  const parent = element.parent();
  return parent && validChildren(parent) || C.html.basicTags;
}

export function isEmptyElement({ tag: tagVal }: Tagged): boolean {
  return C.html.empty.indexOf(tagVal.get()) >= 0;
}

export function isValidChild(
  parent: Tagged,
  { tag: childTag }: Tagged
): boolean {
  const valid = validChildren(parent);
  return valid ? valid.indexOf(childTag.get()) >= 0 : true;
}