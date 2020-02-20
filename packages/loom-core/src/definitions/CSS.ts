import {
  WritableList,
  WritableStringMap,
  WritableValue } from 'loom-data';

import { Definition, Sources } from '../definitions';
import {
  Sheet,
  StyleRule,
  StyleDeclaration,
  RuleList } from '../build/CSS';

export class SheetDef implements Definition {
  public readonly rules: RuleListDef;

  public constructor(rules: RuleListDef | RuleDef[]) {
    this.rules = rules instanceof RuleListDef
      ? rules : new RuleListDef(rules);
  }

  public build(sources: Sources): Sheet {
    return new Sheet(this, sources);
  }

  public serialize(): string {
    return this.rules.serialize();
  }
}

export class RuleListDef extends WritableList<RuleDef> implements Definition {
  public build(sources: Sources): RuleList {
    return new RuleList(this, sources);
  }

  public serialize(): string {
    return this.asArray().map(obj => obj.serialize()).join('\n');
  }
}

export type RuleDef = StyleRuleDef;

export class StyleRuleDef implements Definition {
  public readonly selector: WritableValue<string>;
  public readonly style: StyleDeclarationDef;

  public constructor(
    selector: string,
    style: StyleDeclarationDef | Record<string, string>
  ) {
    this.selector = new WritableValue(selector);
    this.style = style instanceof StyleDeclarationDef
      ? style : new StyleDeclarationDef(style);
  }

  public build(sources: Sources): StyleRule {
    return new StyleRule(this, sources);
  }

  public serialize(): string {
    return this.selector.get() + '{' + this.style.serialize() + '}';
  }
}

export class StyleDeclarationDef
  extends WritableStringMap<string>
  implements Definition {

  public build(sources: Sources): StyleDeclaration {
    return new StyleDeclaration(this, sources);
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