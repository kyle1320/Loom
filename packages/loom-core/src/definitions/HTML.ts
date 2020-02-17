import { Definition, Sources } from '../definitions';
import {
  TextNode,
  Page,
  Component,
  Element,
  Attributes,
  Children,
  HeadElement,
  BodyElement } from '../build/HTML';
import { WritableList } from '../data/List';
import { WritableStringMap } from '../data/StringMap';
import { WritableValue } from '../data/Value';

export type NodeDef =
  TextNodeDef | ElementDef | ComponentDef;

export class TextNodeDef implements Definition {
  public readonly content: WritableValue<string>;

  public constructor(content: string) {
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
  extends WritableStringMap<string>
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

  public serialize(): string {
    return this.asArray().map(obj => obj.serialize()).join('');
  }
}

export class ComponentDef implements Definition {
  public readonly name: WritableValue<string>;

  public constructor(name: string) {
    this.name = new WritableValue(name);
  }

  public build(sources: Sources): Component {
    return new Component(this, sources);
  }

  public serialize(): string {
    return `<loom:${this.name.get()} />`;
  }
}

export class ElementDef implements Definition {
  public readonly tag: WritableValue<string>;
  public readonly attrs: AttributesDef;
  public readonly children: ChildrenDef;

  public constructor(
    tag: string,
    attrs: AttributesDef | Record<string, string>,
    children: ChildrenDef | NodeDef[],
  ) {
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
    attrs: AttributesDef | Record<string, string>,
    children: ChildrenDef | NodeDef[],
  ) {
    super('head', attrs, children); // TODO: make tag read-only
  }

  public build(sources: Sources): HeadElement {
    return new HeadElement(this, sources);
  }
}

export class BodyDef extends ElementDef {
  public constructor(
    attrs: AttributesDef | Record<string, string>,
    children: ChildrenDef | NodeDef[],
  ) {
    super('body', attrs, children); // TODO: make tag read-only
  }

  public build(sources: Sources): BodyElement {
    return new BodyElement(this, sources);
  }
}

export class PageDef implements Definition {
  public constructor(
    public readonly head: HeadDef,
    public readonly body: BodyDef,
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