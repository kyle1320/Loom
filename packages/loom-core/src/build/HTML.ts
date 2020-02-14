import { BuildResult, InterpolatedString, InterpolatedStringMap } from '.';
import { Sources } from '../definitions';
import {
  TextNodeDef,
  PageDef,
  AttributesDef,
  ChildrenDef,
  ElementDef,
  ComponentDef,
  NodeDef} from '../definitions/HTML';

export type Node = TextNode | Element | EmptyComponent;

export class TextNode extends BuildResult<TextNodeDef, {
  'contentChanged': string;
}> {
  private _content: InterpolatedString;

  public constructor(
    public readonly source: TextNodeDef,
    public readonly sources: Sources
  ) {
    super(source, sources);

    this._content = new InterpolatedString(source.content, this.sources.vars);

    this.listen(this._content, 'change', v => this.emit('contentChanged', v));
    this.listen(source, 'contentChanged', val => this._content.value = val);
  }

  public get content(): string {
    return this._content.value;
  }

  public serialize(): string {
    return this._content.value;
  }

  public destroy(): void {
    this._content.destroy();
    super.destroy();
  }
}

export class Attributes extends InterpolatedStringMap<AttributesDef> {
  public serialize(): string {
    const attrs = this.data.asRecord();
    let res = '';
    for (const key in attrs) {
      // TODO: escape
      res += ' ' + key + '="' + attrs[key].value + '"';
    }
    return res;
  }
}

export class Children extends BuildResult<ChildrenDef, {
  'add': { index: number; value: Node };
  'addRaw': { index: number; value: TextNode | Element | Component };
  'update': { index: number; value: Node };
  'remove': number;
}> {
  private readonly data: (TextNode | Element | Component)[];
  private ignoreEvents = false;

  public constructor(
    public readonly source: ChildrenDef,
    public readonly sources: Sources
  ) {
    super(source, sources);

    this.data = source.asArray().map(this.buildChild);

    this.listen(source, 'add', this.sourceAdd);
    this.listen(source, 'remove', this.sourceRemove);
  }

  public addDef(
    def: TextNodeDef | ElementDef,
    index: number = this.data.length
  ): TextNode | Element {
    const built = this.buildChild(def);

    this.ignoreEvents = true;
    this.source.add(def, index);
    this.data.splice(index, 0, built);
    this.emit('add', { index, value: this.get(index) });
    this.emit('addRaw', { index, value: this.data[index] });
    this.ignoreEvents = false;

    return built as TextNode | Element;
  }

  public addDefBefore(
    def: TextNodeDef | ElementDef,
    reference: TextNode | Element
  ): TextNode | Element | null {
    const index = this.data.indexOf(reference);
    if (index > -1) {
      return this.addDef(def, index);
    }
    return null;
  }

  public get(index: number): Node {
    const res = this.data[index];

    if (res instanceof Component) {
      return res.element;
    } else {
      return res;
    }
  }

  public *[Symbol.iterator](): IterableIterator<Node> {
    for (let i = 0; i < this.size(); i++) {
      yield this.get(i);
    }
  }

  public raw(): Readonly<(TextNode | Element | Component)[]> {
    return this.data;
  }

  public size(): number {
    return this.data.length;
  }

  public serialize(): string {
    return this.data.map(obj => obj.serialize()).join('');
  }

  public destroy(): void {
    this.data.forEach(d => d.destroy());
    super.destroy();
  }

  private buildChild = (def: NodeDef): TextNode | Element | Component => {
    const built = def.build(this.sources);
    if (built instanceof Component) {
      built.on('elementChanged', el => this.emit('update', {
        index: this.data.indexOf(built),
        value: el
      }));
    }
    return built;
  }

  private sourceAdd = (
    { index, value }: { index: number; value: NodeDef }
  ): void => {
    if (this.ignoreEvents) return;

    this.data.splice(index, 0, this.buildChild(value));
    this.emit('add', { index, value: this.get(index) });
    this.emit('addRaw', { index, value: this.data[index] });
  }

  private sourceRemove = ({ index }: { index: number }): void => {
    if (this.ignoreEvents) return;

    this.data.splice(index, 1)[0].destroy();
    this.emit('remove', index);
  }
}

export class Element extends BuildResult<ElementDef, {
  tagChanged: string;
}> {
  private _tag: string;
  public readonly attrs: Attributes;
  public readonly children: Children;

  public constructor(
    public readonly source: ElementDef,
    public readonly sources: Sources
  ) {
    super(source, sources);

    this._tag = source.tag;
    this.attrs = source.attrs.build(sources);
    this.children = source.children.build(sources);

    this.listen(source, 'tagChanged', tag => this.updateTag(tag));
  }

  private updateTag(tag: string): void {
    if (this._tag !== tag) {
      this._tag = tag;
      this.emit('tagChanged', tag);
    }
  }

  public get tag(): string {
    return this._tag;
  }

  public serialize(): string {
    const tag = this.tag;
    const attrs = this.attrs.serialize();
    const content = this.children.serialize();
    return `<${tag}${attrs}>${content}</${tag}>`;
  }

  public destroy(): void {
    this.attrs.destroy();
    this.children.destroy();
    super.destroy();
  }
}

export class HeadElement extends Element {
  // TODO: inject styles
}

export class BodyElement extends Element {

}

export class EmptyComponent extends BuildResult<ComponentDef> {
  public serialize(): string {
    return '';
  }
}

export class Component extends BuildResult<ComponentDef, {
  'elementChanged': Element | EmptyComponent;
}> {
  private name!: string;
  private _element!: Element | EmptyComponent;

  public constructor(
    public readonly source: ComponentDef,
    public readonly sources: Sources
  ) {
    super(source, sources);

    this.update(source.name);

    this.listen(source, 'nameChanged', this.update);
  }

  private componentUpdated = (): void => this.update();

  private update = (name: string = this.name): void => {
    if (this.name !== name) {
      if (this.name) {
        this.sources.components.offKey(this.name, this.componentUpdated);
      }
      this.sources.components.onKey(name, this.componentUpdated);
    }
    this.name = name;

    const component = name && this.sources.components.get(name);

    if (this._element) this._element.destroy();

    this._element = component
      ? component.build(this.sources)
      : new EmptyComponent(this.source, this.sources);

    this.emit('elementChanged', this._element);
  }

  public get element(): Element | EmptyComponent {
    return this._element;
  }

  public serialize(): string {
    return this._element.serialize();
  }

  public destroy(): void {
    if (this.name) {
      this.sources.components.offKey(this.name, this.componentUpdated);
    }
    this._element && this._element.destroy();
    super.destroy();
  }
}

export class Page extends BuildResult<PageDef> {
  public readonly head: HeadElement;
  public readonly body: BodyElement;

  public constructor(
    public readonly source: PageDef,
    public readonly sources: Sources
  ) {
    super(source, sources);

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
    super.destroy();
  }
}