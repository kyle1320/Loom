import { Definition, Sources } from '../definitions';
import {
  Sheet,
  Rule,
  StyleRule,
  StyleDeclaration,
  RuleList } from '../build/CSS';
import { WritableList } from '../data/List';
import { EventEmitter } from '../util/EventEmitter';
import { WritableStringMap } from '../data/StringMap';

export class SheetDef
  extends EventEmitter<{
    'locationChanged': string;
  }> implements Definition {

  public readonly rules: RuleListDef;

  public constructor(
    private _location: string,
    rules: RuleListDef | RuleDef[]
  ) {
    super();

    this.rules = rules instanceof RuleListDef
      ? rules : new RuleListDef(rules);
  }

  public get location(): string {
    return this._location;
  }

  public set location(val: string) {
    if (this._location !== val) {
      this._location = val;
      this.emit('locationChanged', val);
    }
  }

  public build(sources: Sources): Sheet {
    return new Sheet(this, sources);
  }
}

export class RuleListDef
  extends WritableList<RuleDef>
  implements Definition {

  public build(sources: Sources): RuleList {
    return new RuleList(this, sources);
  }
}

export abstract class RuleDef implements Definition {
  public abstract build(sources: Sources): Rule;
}

export class StyleRuleDef
  extends EventEmitter<{
    'selectorChanged': string;
  }> implements Definition {

  public readonly style: StyleDeclarationDef;

  public constructor(
    private _selectorText: string,
    style: StyleDeclarationDef | Record<string, string>
  ) {
    super();

    this.style = style instanceof StyleDeclarationDef
      ? style : new StyleDeclarationDef(style);
  }

  public set selectorText(val: string) {
    if (this._selectorText !== val) {
      this._selectorText = val;
      this.emit('selectorChanged', val);
    }
  }

  public get selectorText(): string {
    return this._selectorText;
  }

  public build(sources: Sources): StyleRule {
    return new StyleRule(this, sources);
  }
}

export class StyleDeclarationDef
  extends WritableStringMap<string>
  implements Definition {

  public build(sources: Sources): StyleDeclaration {
    return new StyleDeclaration(this, sources);
  }
}