import { EventEmitter } from '../util/EventEmitter';
import { Definition, Sources } from '../definitions';
import {
  TextNode,
  Page,
  Component,
  Element,
  Attributes,
  Children } from '../build/HTML';
import { WritableList } from '../data/List';
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
}

export class AttributesDef
  extends WritableStringMap<string>
  implements Definition {

  public build(sources: Sources): Attributes {
    return new Attributes(this, sources);
  }
}

export class ChildrenDef
  extends WritableList<NodeDef>
  implements Definition {

  public build(sources: Sources): Children {
    return new Children(this, sources);
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
}

export class PageDef
  extends EventEmitter<{
    'locationChanged': string;
  }> implements Definition {
  public constructor(
    private _location: string,
    public readonly head: ElementDef,
    public readonly body: ElementDef,
  ) {
    super();
  }

  public get location(): string {
    return this._location;
  }

  public set location(val: string) {
    if (this._location !== val) {
      this._location = val;
      this.emit('locationChanged', val);
    }
  }

  public build(sources: Sources): Page {
    return new Page(this, sources);
  }
}