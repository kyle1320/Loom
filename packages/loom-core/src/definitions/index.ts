import { ElementDef, PageDef } from './HTML';
import { BuildResult, Results } from '../build';
import { WritableStringMap } from '../data/StringMap';
import { WritableList } from '../data/List';
import { SheetDef } from './CSS';

export interface Definition {
  build(sources: Sources): BuildResult<Definition>;
}

export class Sources {
  public readonly vars: WritableStringMap<string>;
  public readonly components: WritableStringMap<ElementDef>;

  public readonly pages: WritableList<PageDef>;
  public readonly stylesheets: WritableList<SheetDef>;

  public constructor(
    vars: WritableStringMap<string> | Record<string, string> = {},
    components: WritableStringMap<ElementDef> | Record<string, ElementDef> = {},
    pages: WritableList<PageDef> | PageDef[] = [],
    stylesheets: WritableList<SheetDef> | SheetDef[] = []
  ) {
    this.vars = vars instanceof WritableStringMap
      ? vars : new WritableStringMap(vars);
    this.components = components instanceof WritableStringMap
      ? components : new WritableStringMap(components);
    this.pages = pages instanceof WritableList
      ? pages : new WritableList(pages)
    this.stylesheets = stylesheets instanceof WritableList
      ? stylesheets : new WritableList(stylesheets);
  }

  public build(): Results {
    return new Results(this);
  }
}