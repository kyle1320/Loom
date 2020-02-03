import { ElementDef, PageDef } from './HTML';
import { BuildResult, Results } from '../build';
import { WritableStringMap } from '../data/StringMap';
import { SheetDef } from './CSS';

export interface Definition {
  serialize(): string;
  build(sources: Sources): BuildResult<Definition>;
}

export type ContentDef = PageDef | SheetDef;

export class Sources {
  public readonly vars: WritableStringMap<string>;
  public readonly components: WritableStringMap<ElementDef>;
  public readonly content: WritableStringMap<ContentDef>;

  public constructor(
    vars: WritableStringMap<string> | Record<string, string> = {},
    components: WritableStringMap<ElementDef> | Record<string, ElementDef> = {},
    content: WritableStringMap<ContentDef> | Record<string, ContentDef> = {}
  ) {
    this.vars = vars instanceof WritableStringMap
      ? vars : new WritableStringMap(vars);
    this.components = components instanceof WritableStringMap
      ? components : new WritableStringMap(components);
    this.content = content instanceof WritableStringMap
      ? content : new WritableStringMap(content);
  }

  public build(): Results {
    return new Results(this);
  }
}