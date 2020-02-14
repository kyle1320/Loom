import { EventEmitter } from '../util/EventEmitter';
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
import { List } from '../data/List';
import { WritableStringMap } from '../data/StringMap';

export type NodeDef =
  TextNodeDef | ElementDef | ComponentDef;

export class TextNodeDef
  extends EventEmitter<{
    'contentChanged': string;
  }> implements Definition {
  public constructor(
    private _content: string
  ) {
    super();
  }

  public get content(): string {
    return this._content;
  }

  public set content(val: string) {
    if (this._content !== val) {
      this._content = val;
      this.emit('contentChanged', val);
    }
  }

  public build(sources: Sources): TextNode {
    return new TextNode(this, sources);
  }

  public serialize(): string {
    return this.content;
  }
}

export class AttributesDef
  extends WritableStringMap<string>
  implements Definition {

  public constructor(
    data?: Record<string, string>,
  ) {
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

export class ChildrenDef
  extends List<NodeDef>
  implements Definition {

  public build(sources: Sources): Children {
    return new Children(this, sources);
  }

  public serialize(): string {
    return this.asArray().map(obj => obj.serialize()).join('');
  }
}

export class ComponentDef
  extends EventEmitter<{
    'nameChanged': string;
  }> implements Definition {

  public constructor(
    private _name: string
  ) {
    super();
  }

  public get name(): string {
    return this._name;
  }

  public set name(val: string) {
    if (this._name !== val) {
      this._name = val;
      this.emit('nameChanged', val);
    }
  }

  public build(sources: Sources): Component {
    return new Component(this, sources);
  }

  public serialize(): string {
    return `<loom:${this.name} />`;
  }
}

export class ElementDef
  extends EventEmitter<{
    'tagChanged': string;
  }> implements Definition {

  public readonly attrs: AttributesDef;
  public readonly children: ChildrenDef;

  public constructor(
    private _tag: string,
    attrs: AttributesDef | Record<string, string>,
    children: ChildrenDef | NodeDef[],
  ) {
    super();

    this.attrs = attrs instanceof AttributesDef
      ? attrs : new AttributesDef(attrs);
    this.children = children instanceof ChildrenDef
      ? children : new ChildrenDef(children);
  }

  public get tag(): string {
    return this._tag;
  }

  public set tag(val: string) {
    if (this._tag !== val) {
      this._tag = val;
      this.emit('tagChanged', val);
    }
  }

  public build(sources: Sources): Element {
    return new Element(this, sources);
  }

  public serialize(): string {
    const tag = this.tag;
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
    super('head', attrs, children);
  }

  public get tag(): string {
    return 'head';
  }

  public set tag(val: string) {
    // Tag can't be changed
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
    super('body', attrs, children);
  }

  public get tag(): string {
    return 'body';
  }

  public set tag(val: string) {
    // Tag can't be changed
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