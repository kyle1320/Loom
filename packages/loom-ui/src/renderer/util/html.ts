import { Value } from 'loom-data';
import { ElementDef } from 'loom-core';

import C from './constants';

type Tagged = { tag: Value<string> };

export function validChildren({ tag: tagVal }: Tagged): Readonly<string[]> {
  const tag = tagVal.get();

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
    default: return C.html.basicTags;
  }
}

export function validTags(element: ElementDef): Readonly<string[]> {
  const parent = element.parent();
  return parent ? validChildren(parent) : C.html.basicTags;
}

export function isEmptyElement({ tag: tagVal }: Tagged): boolean {
  return C.html.empty.indexOf(tagVal.get()) >= 0;
}