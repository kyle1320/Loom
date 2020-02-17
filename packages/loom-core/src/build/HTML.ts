import { BuildResult, InterpolatedString } from '.';
import { Sources } from '../definitions';
import {
  TextNodeDef,
  PageDef,
  AttributesDef,
  ChildrenDef,
  ElementDef,
  ComponentDef,
  NodeDef} from '../definitions/HTML';
import { Value, WritableValue } from '../data/Value';
import { MappedList } from '../data/List';
import { MappedStringMap } from '../data/StringMap';

export type Node = TextNode | Element | UnknownComponent;

export class TextNode implements BuildResult<TextNodeDef> {
  public readonly content: InterpolatedString;

  public constructor(
    public readonly source: TextNodeDef,
    public readonly sources: Sources
  ) {
    this.content = new InterpolatedString(source.content.get(), sources.vars);

    source.content.on('change', this.content.update);
  }

  public serialize(): string {
    return this.content.get();
  }

  public destroy(): void {
    this.content.destroy();
    this.source.content.off('change', this.content.update);
  }
}

export class Attributes
  extends MappedStringMap<string, string>
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

  public constructor(
    public readonly source: ElementDef,
    public readonly sources: Sources
  ) {
    this.tag = source.tag;
    this.attrs = source.attrs.build(sources);
    this.children = source.children.build(sources);
  }

  public serialize(): string {
    const tag = this.tag.get();
    const attrs = this.attrs.serialize();
    const content = this.children.serialize();
    return `<${tag}${attrs}>${content}</${tag}>`;
  }

  public destroy(): void {
    this.attrs.destroy();
    this.children.destroy();
  }
}

export class HeadElement extends Element {
  // TODO: inject styles
}

export class BodyElement extends Element {

}

export class UnknownComponent implements BuildResult<ComponentDef> {
  public constructor(
    public readonly source: ComponentDef,
    public readonly sources: Sources
  ) {}

  public serialize(): string {
    return '';
  }

  public destroy(): void {
    //
  }
}

export class Component implements BuildResult<ComponentDef> {
  private readonly name: Value<string>;
  private readonly writableElement: WritableValue<Element | UnknownComponent>;
  public readonly element: Value<Element | UnknownComponent>;

  public constructor(
    public readonly source: ComponentDef,
    public readonly sources: Sources
  ) {
    this.name = source.name;
    this.element =
      this.writableElement =
        new WritableValue<Element | UnknownComponent>(
          new UnknownComponent(source, sources));

    this.element.watch((_, oldValue) => oldValue?.destroy());
    this.name.watch(this.update);
  }

  private updateComponent = (): void => {
    const component = this.sources.components.get(this.name.get());

    this.writableElement.set(component
      ? component.build(this.sources)
      : new UnknownComponent(this.source, this.sources));
  }

  private update = (name: string, oldName: string | undefined): void => {
    if (oldName) {
      this.sources.components.offKey(oldName, this.updateComponent);
    }
    this.sources.components.onKey(name, this.updateComponent);
    this.updateComponent();
  }

  public serialize(): string {
    return this.element.get().serialize();
  }

  public destroy(): void {
    this.name.off('change', this.update);
    this.sources.components.offKey(this.name.get(), this.updateComponent);
    this.element.get().destroy();
  }
}

export class Page implements BuildResult<PageDef> {
  public readonly head: HeadElement;
  public readonly body: BodyElement;

  public constructor(
    public readonly source: PageDef,
    public readonly sources: Sources
  ) {
    this.head = source.head.build(this.sources);
    this.body = source.body.build(this.sources);
  }

  public serialize(): string {
    return '<!doctype HTML><html>' +
      this.head.serialize() +
      this.body.serialize() +
      '</html>';
  }

  public destroy(): void {
    this.head.destroy();
    this.body.destroy();
  }
}