import { BuildResult, InterpolatedStringMap } from '.';
import {
  SheetDef,
  RuleDef,
  StyleRuleDef,
  StyleDeclarationDef } from '../definitions/CSS';
import { Sources } from '../Definitions';
import { WritableList } from '../data/List';

export class Sheet extends BuildResult<SheetDef, {
  'add': { index: number; value: Rule };
  'remove': number;
}> {
  private readonly data: WritableList<Rule>;

  public constructor(
    public readonly source: SheetDef,
    public readonly sources: Sources
  ) {
    super(source, sources);

    this.data =
      new WritableList<Rule>(source.asArray().map(v => v.build(sources)))
        .on('add', data => this.emit('add', data))
        .on('remove', ({ index }) => this.emit('remove', index));

    source.on('add', ({ value, index }) => {
      this.data.add(value.build(sources), index);
    });
    source.on('remove', ({ index }) => this.data.remove(index));
  }

  public get(index: number): Rule {
    return this.data.get(index);
  }

  public size(): number {
    return this.data.size();
  }

  public serialize(): string {
    return this.data.asArray().map(obj => obj.serialize()).join('\n');
  }

  public destroy(): void {
    for (const obj of this.data) {
      obj.destroy();
    }
    super.destroy();
  }
}

export abstract class Rule extends BuildResult<RuleDef> {
  public abstract serialize(): string;
}

export class StyleRule extends BuildResult<StyleRuleDef, {
  'selectorChanged': string;
}> {
  private _selector: string;
  public readonly style: StyleDeclaration;

  public constructor(
    public readonly source: StyleRuleDef,
    public readonly sources: Sources
  ) {
    super(source, sources);

    this._selector = source.selectorText;
    this.style = source.style.build(sources);

    this.listen(source, 'selectorChanged', this.updateSelector);
  }

  private updateSelector = (selector: string): void => {
    if (this._selector !== selector) {
      this._selector = selector;
      this.emit('selectorChanged', selector);
    }
  }

  public get selector(): string {
    return this._selector;
  }

  public serialize(): string {
    return this.selector + '{' + this.style.serialize() + '}';
  }
}

export class StyleDeclaration
  extends InterpolatedStringMap<StyleDeclarationDef> {

  public serialize(): string {
    const data = this.data.asRecord();
    let res = '';
    for (const key in data) {
      res += key + ':' + data[key].value + ';';
    }
    return res;
  }
}