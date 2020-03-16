import {
  WritableList,
  WritableDictionary,
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

  public add(value: RuleDef, index?: number): void {
    ruleParentMap.set(value, this);
    super.add(value, index);
  }

  public serialize(): string {
    return this.asArray().map(obj => obj.serialize()).join('\n');
  }
}

export type RuleDef = StyleRuleDef;

const ruleParentMap: WeakMap<RuleDef, RuleListDef> = new WeakMap();
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

  public delete(): boolean {
    const parent = ruleParentMap.get(this);
    if (parent) {
      ruleParentMap.delete(this);
      return parent.remove(this);
    }
    return false;
  }

  public hasParent(): boolean {
    return !!ruleParentMap.get(this);
  }

  public build(sources: Sources): StyleRule {
    return new StyleRule(this, sources);
  }

  public serialize(): string {
    return this.selector.get() + '{' + this.style.serialize() + '}';
  }
}

export class StyleDeclarationDef
  extends WritableDictionary<string>
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