import {
  WritableList,
  WritableDictionary,
  WritableValue } from 'loom-data';

import { Definition, Sources } from '../definitions';
import {
  TextNode,
  Page,
  Component,
  Element,
  Attributes,
  Children,
  HeadElement,
  BodyElement,
  Node } from '../build/HTML';

const nodeParentMap: WeakMap<NodeDef, ChildrenDef> = new WeakMap();
export abstract class NodeDef implements Definition {
  public delete(): boolean {
    const parent = nodeParentMap.get(this);
    if (parent) {
      nodeParentMap.delete(this);
      return parent.remove(this);
    }
    return false;
  }
  public hasParent(): boolean {
    return !!nodeParentMap.get(this);
  }

  public abstract build(sources: Sources): Node;
  public abstract serialize(): string;
}

export class TextNodeDef extends NodeDef {
  public readonly content: WritableValue<string>;

  public constructor(content: string) {
    super();
    this.content = new WritableValue(content);
  }

  public build(sources: Sources): TextNode {
    return new TextNode(this, sources);
  }

  public serialize(): string {
    return this.content.get();
  }
}

export class AttributesDef
  extends WritableDictionary<string>
  implements Definition {

  public constructor(data?: Record<string, string>) {
    super(data, k => k.toLowerCase().replace(/ /g, '-'));
  }

  public build(sources: Sources): Attributes {
    return new Attributes(this, sources);
  }

  public serialize(): string {
    const attrs = this.asRecord();
    let res = '';
    for (const key in attrs) {
      // TODO: escape
      res += ' ' + key + '="' + attrs[key] + '"';
    }
    return res;
  }
}

export class ChildrenDef extends WritableList<NodeDef> implements Definition {
  public build(sources: Sources): Children {
    return new Children(this, sources);
  }

  public add(value: NodeDef, index?: number): void {
    nodeParentMap.set(value, this);
    super.add(value, index);
  }

  public serialize(): string {
    return this.asArray().map(obj => obj.serialize()).join('');
  }
}

export class ComponentDef extends NodeDef {
  public readonly name: WritableValue<string>;

  public constructor(name: string) {
    super();
    this.name = new WritableValue(name);
  }

  public build(sources: Sources): Component {
    return new Component(this, sources);
  }

  public serialize(): string {
    return `<loom:${this.name.get()}></loom:${this.name.get()}>`;
  }
}

export class ElementDef extends NodeDef {
  public readonly tag!: WritableValue<string>;
  public readonly attrs!: AttributesDef;
  public readonly children!: ChildrenDef;

  public constructor(
    tag: string,
    attrs: AttributesDef | Record<string, string> = {},
    children: ChildrenDef | NodeDef[] = [],
  ) {
    super();

    tag = tag.toLowerCase();

    if (this.constructor === ElementDef) {
      if (tag === 'head') return new HeadDef(attrs, children);
      if (tag === 'body') return new BodyDef(attrs, children);
    }

    this.tag = new WritableValue(tag);
    this.attrs = attrs instanceof AttributesDef
      ? attrs : new AttributesDef(attrs);
    this.children = children instanceof ChildrenDef
      ? children : new ChildrenDef(children);
  }

  public build(sources: Sources): Element {
    return new Element(this, sources);
  }

  public serialize(): string {
    const tag = this.tag.get();
    const attrs = this.attrs.serialize();
    const content = this.children.serialize();
    return `<${tag}${attrs}>${content}</${tag}>`;
  }
}

export class HeadDef extends ElementDef {
  public constructor(
    attrs: AttributesDef | Record<string, string> = {},
    children: ChildrenDef | NodeDef[] = [],
  ) {
    super('head', attrs, children);
    this.tag.freeze();
  }

  public build(sources: Sources): HeadElement {
    return new HeadElement(this, sources);
  }
}

export class BodyDef extends ElementDef {
  public constructor(
    attrs: AttributesDef | Record<string, string> = {},
    children: ChildrenDef | NodeDef[] = [],
  ) {
    super('body', attrs, children);
    this.tag.freeze();
  }

  public build(sources: Sources): BodyElement {
    return new BodyElement(this, sources);
  }
}

export class PageDef implements Definition {
  public constructor(
    public readonly head: HeadDef = new HeadDef(),
    public readonly body: BodyDef = new BodyDef(),
  ) { }

  public build(sources: Sources): Page {
    return new Page(this, sources);
  }

  public serialize(): string {
    return '<!doctype HTML><html>' +
      this.head.serialize() +
      this.body.serialize() +
      '</html>';
  }
}