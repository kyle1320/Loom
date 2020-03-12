import {
  MappedList,
  Value,
  MappedDictionary,
  Destroyable } from 'loom-data';

import { BuildResult } from '.';
import {
  StyleRuleDef,
  StyleDeclarationDef,
  RuleListDef,
  SheetDef,
  RuleDef } from '../definitions/CSS';
import { Sources } from '../Definitions';

export class Sheet implements BuildResult<SheetDef> {
  public readonly rules: RuleList;
  public readonly destroy = Destroyable.make();

  public constructor(
    public readonly source: SheetDef,
    public readonly sources: Sources
  ) {
    this.destroy.do(
      this.rules = source.rules.build(this.sources)
    );
  }

  public serialize(): string {
    return this.rules.serialize();
  }
}

export class RuleList
  extends MappedList<RuleDef, Rule>
  implements BuildResult<RuleListDef> {

  public constructor(
    public readonly source: RuleListDef,
    public readonly sources: Sources
  ) {
    super(
      source,
      def => def.build(sources),
      b => b.destroy()
    );

    this.destroy.do(() => this.data.forEach(d => d.destroy()));
  }

  public serialize(): string {
    return this.data.map(obj => obj.serialize()).join('\n');
  }
}

export type Rule = StyleRule;

export class StyleRule implements BuildResult<StyleRuleDef> {
  public readonly selector: Value<string>;
  public readonly style: StyleDeclaration;
  public readonly destroy = Destroyable.make();

  public constructor(
    public readonly source: StyleRuleDef,
    public readonly sources: Sources
  ) {
    this.selector = source.selector;
    this.destroy.do(
      this.style = source.style.build(sources)
    );
  }

  public serialize(): string {
    return this.selector.get() + '{' + this.style.serialize() + '}';
  }
}

export class StyleDeclaration
  extends MappedDictionary<string, string>
  implements BuildResult<StyleDeclarationDef> {

  public constructor(
    public readonly source: StyleDeclarationDef,
    public readonly sources: Sources
  ) {
    super(source, k => k, () => { /* */ });
  }

  public serialize(): string {
    const data = this.asRecord();
    let res = '';
    for (const key in data) {
      res += key + ':' + data[key] + ';';
    }
    return res;
  }
}