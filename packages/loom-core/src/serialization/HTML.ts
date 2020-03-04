import * as fs from 'fs';
import * as path from 'path';
import * as htmlparser from 'htmlparser2';
import {
  Node as DomNode,
  Element as DomElement,
  DataNode as DomDataNode } from 'domhandler';

import {
  ElementDef,
  PageDef,
  NodeDef,
  TextNodeDef,
  ComponentDef } from '../definitions/HTML';
import { Sources } from '../definitions';
import { walkDir } from '.';

export function importPage(
  root: string,
  file: string
): PageDef {
  return (function getPage(els: DomNode[]): PageDef {
    let head: ElementDef = null!;
    let body: ElementDef = null!;
    for (const node of els) {
      if (node instanceof DomElement) {
        if (node.name.toLowerCase() === 'html') {
          return getPage(node.children);
        } else if (node.name.toLowerCase() === 'head') {
          head = parseElement(node);
        } else if (node.name.toLowerCase() === 'body') {
          body = parseElement(node);
        }
      }
    }
    if (!head) {
      head = new ElementDef('head', {}, []);
      if (!body) {
        body = new ElementDef('body', {}, mapChildren(els))
      }
    }
    if (!body) {
      body = new ElementDef('body', {}, [])
    }
    return new PageDef(head, body);
  }(htmlparser.parseDOM(
    fs.readFileSync(path.join(root, file)).toString()
  )));
}

function importComponent(root: string, file: string): ElementDef {
  const dom = htmlparser.parseDOM(
    fs.readFileSync(path.join(root, file)).toString()
  );
  for (const node of dom) {
    if (node instanceof DomElement) {
      return parseElement(node);
    }
  }
  throw new Error('invalid component');
}

function tryParse(node: DomNode): NodeDef | null {
  if (node instanceof DomElement) {
    if (node.name.startsWith('loom:')) {
      return new ComponentDef(node.name.substring(5));
    }
    return parseElement(node);
  } else if (node instanceof DomDataNode && node.nodeType === 3) {
    return new TextNodeDef(node.data);
  }
  return null;
}

function mapChildren(nodes: DomNode[]): NodeDef[] {
  return nodes.map(n => tryParse(n)).filter(Boolean) as NodeDef[];
}

function parseElement(el: DomElement): ElementDef {
  return new ElementDef(
    el.name,
    el.attribs,
    mapChildren(el.childNodes)
  );
}

export function importComponents(
  root: string,
  sources: Sources
): void {
  const found: Record<string, string> = {};

  walkDir(root, rel => {
    const parsed = path.parse(rel);
    switch (parsed.ext) {
      case '.html':
      case '.htm':
        found[parsed.name] = rel;
        sources.components.set(parsed.name, null!);
        break;
    }
  });

  for (const key in found) {
    sources.components.set(key, importComponent(root, found[key]));
  }
}