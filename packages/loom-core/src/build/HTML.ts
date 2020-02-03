import { BuildResult, InterpolatedString, InterpolatedStringMap } from '.';
import { Sources } from '../definitions';
import {
  TextNodeDef,
  PageDef,
  AttributesDef,
  ChildrenDef,
  ElementDef,
  ComponentDef} from '../definitions/HTML';
import { ComputedList } from '../data/List';

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
  'update': { index: number; value: Node };
  'remove': number;
}> {
  private readonly data: ComputedList<TextNode | Element | Component>;

  public constructor(
    public readonly source: ChildrenDef,
    public readonly sources: Sources
  ) {
    super(source, sources);

    this.data = source.map(def => {
      const built = def.build(sources);
      if (built instanceof Component) {
        built.on('elementChanged', el => this.emit('update', {
          index: this.data.asArray().indexOf(built),
          value: el
        }));
      }
      return built;
    }, value => value.destroy())
      .on('add', ({ index }) =>
        this.emit('add', { index, value: this.get(index) }))
      .on('remove', ({ index }) => this.emit('remove', index));
  }

  public get(index: number): Node {
    const res = this.data.get(index);

    if (res instanceof Component) {
      return res.element;
    } else {
      return res;
    }
  }

  public size(): number {
    return this.data.size();
  }

  public serialize(): string {
    return this.data.asArray().map(obj => obj.serialize()).join('');
  }

  public destroy(): void {
    this.data.destroy();
    super.destroy();
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

    const component = this.sources.components.get(name);

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
    return this._element ? this._element.serialize() : '';
  }

  public destroy(): void {
    this.sources.components.offKey(this.name, this.componentUpdated);
    this._element && this._element.destroy();
    super.destroy();
  }
}

export class Page extends BuildResult<PageDef> {
  public readonly head: Element;
  public readonly body: Element;

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