import {
  MappedList,
  Value,
  MappedDictionary } from 'loom-data';

import { BuildResult } from '.';
import {
  StyleRuleDef,
  StyleDeclarationDef,
  RuleListDef,
  SheetDef,
  RuleDef} from '../definitions/CSS';
import { Sources } from '../Definitions';

export class Sheet implements BuildResult<SheetDef> {
  public readonly rules: RuleList;

  public constructor(
    public readonly source: SheetDef,
    public readonly sources: Sources
  ) {
    this.rules = source.rules.build(this.sources);
  }

  public serialize(): string {
    return this.rules.serialize();
  }

  public destroy(): void {
    this.rules.destroy();
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
  }

  public serialize(): string {
    return this.data.map(obj => obj.serialize()).join('\n');
  }

  public destroy(): void {
    this.data.forEach(d => d.destroy());
  }
}

export type Rule = StyleRule;

export class StyleRule implements BuildResult<StyleRuleDef> {
  public readonly selector: Value<string>;
  public readonly style: StyleDeclaration;

  public constructor(
    public readonly source: StyleRuleDef,
    public readonly sources: Sources
  ) {
    this.selector = source.selector;
    this.style = source.style.build(sources);
  }

  public serialize(): string {
    return this.selector.get() + '{' + this.style.serialize() + '}';
  }

  public destroy(): void {
    //
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