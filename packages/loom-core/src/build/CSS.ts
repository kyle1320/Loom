import { BuildResult, InterpolatedStringMap } from '.';
import {
  StyleRuleDef,
  StyleDeclarationDef,
  RuleListDef,
  SheetDef } from '../definitions/CSS';
import { Sources } from '../Definitions';
import { ComputedList } from '../data/List';

export class Sheet extends BuildResult<SheetDef> {
  public readonly rules: RuleList;

  public constructor(
    public readonly source: SheetDef,
    public readonly sources: Sources
  ) {
    super(source, sources);

    this.rules = source.rules.build(this.sources);
  }

  public serialize(): string {
    return this.rules.serialize();
  }

  public destroy(): void {
    this.rules.destroy();
    super.destroy();
  }
}

export class RuleList extends BuildResult<RuleListDef, {
  'add': { index: number; value: Rule };
  'remove': number;
}> {
  private readonly data: ComputedList<Rule>;

  public constructor(
    public readonly source: RuleListDef,
    public readonly sources: Sources
  ) {
    super(source, sources);

    this.data = source.map(x => x.build(sources), x => x.destroy())
      .on('add', data => this.emit('add', data))
      .on('remove', ({ index }) => this.emit('remove', index));
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
    this.data.destroy();
    super.destroy();
  }
}

export type Rule = StyleRule;

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