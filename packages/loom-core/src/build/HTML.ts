import {
  MappedList,
  MappedDictionary,
  MappedValue,
  DictionaryValue,
  Value,
  Destroyable } from 'loom-data';

import { BuildResult } from '.';
import { Sources } from '../definitions';
import {
  TextNodeDef,
  PageDef,
  AttributesDef,
  ChildrenDef,
  ElementDef,
  ComponentDef,
  NodeDef} from '../definitions/HTML';

export type Node = TextNode | Element | Component;

export class TextNode implements BuildResult<TextNodeDef> {
  public readonly content: Value<string>;
  public readonly destroy = Destroyable.make();

  public constructor(
    public readonly source: TextNodeDef,
    public readonly sources: Sources
  ) {
    this.content = source.content;
  }

  public serialize(): string {
    return this.content.get();
  }
}

export class Attributes
  extends MappedDictionary<string, string>
  implements BuildResult<AttributesDef> {

  public constructor(
    public readonly source: AttributesDef,
    public readonly sources: Sources
  ) {
    super(source, k => k, () => { /* */ });
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

export class Children
  extends MappedList<NodeDef, TextNode | Element | Component>
  implements BuildResult<ChildrenDef> {

  public constructor(
    public readonly source: ChildrenDef,
    public readonly sources: Sources
  ) {
    super(
      source,
      def => def.build(sources),
      node => node.destroy()
    );
  }

  public addDef(
    def: NodeDef,
    index: number = this.data.length
  ): TextNode | Element | Component {
    return this.addThrough(def, index);
  }

  public addDefBefore(
    def: NodeDef,
    reference: TextNode | Element | Component
  ): TextNode | Element | Component | null {
    const index = this.data.indexOf(reference);
    if (index > -1) {
      return this.addDef(def, index);
    }
    return null;
  }

  public serialize(): string {
    return this.data.map(obj => obj.serialize()).join('');
  }
}

export class Element implements BuildResult<ElementDef> {
  public readonly tag: Value<string>;
  public readonly attrs: Attributes;
  public readonly children: Children;
  public readonly destroy = Destroyable.make();

  public constructor(
    public readonly source: ElementDef,
    public readonly sources: Sources
  ) {
    this.tag = source.tag;
    this.destroy.do(
      this.attrs = source.attrs.build(sources),
      this.children = source.children.build(sources)
    );
  }

  public serialize(): string {
    const tag = this.tag.get();
    const attrs = this.attrs.serialize();
    const content = this.children.serialize();
    return `<${tag}${attrs}>${content}</${tag}>`;
  }
}

export class HeadElement extends Element {
  // TODO: inject styles
}

export class BodyElement extends Element {

}

export class UnknownComponent implements BuildResult<ComponentDef> {
  public readonly destroy = Destroyable.make();

  public constructor(
    public readonly source: ComponentDef,
    public readonly sources: Sources
  ) {}

  public serialize(): string {
    return '';
  }
}

export class Component implements BuildResult<ComponentDef> {
  private readonly component: DictionaryValue<ElementDef>;
  public readonly element: Value<Element | UnknownComponent>;
  public readonly destroy = Destroyable.make();

  public constructor(
    public readonly source: ComponentDef,
    public readonly sources: Sources
  ) {
    this.destroy.do(
      this.component = new DictionaryValue(sources.components, source.name),
      this.element = new MappedValue(
        this.component,
        component => component
          ? component.build(this.sources)
          : new UnknownComponent(this.source, this.sources),
        el => el.destroy()
      )
    );
  }

  public serialize(): string {
    return this.element.get().serialize();
  }
}

export class Page implements BuildResult<PageDef> {
  public readonly head: HeadElement;
  public readonly body: BodyElement;
  public readonly destroy = Destroyable.make();

  public constructor(
    public readonly source: PageDef,
    public readonly sources: Sources
  ) {
    this.destroy.do(
      this.head = source.head.build(this.sources),
      this.body = source.body.build(this.sources)
    );
  }

  public serialize(): string {
    return '<!doctype HTML><html>' +
      this.head.serialize() +
      this.body.serialize() +
      '</html>';
  }
}