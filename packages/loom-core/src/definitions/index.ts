import { ElementDef } from './HTML';
import { BuildResult } from '../build';
import { WritableStringMap } from '../data/StringMap';

export interface Definition {
  build(sources: Sources): BuildResult<Definition>;
}

export class Sources {
  public readonly vars: WritableStringMap<string>;
  public readonly components: WritableStringMap<ElementDef>;

  public constructor(
    vars: WritableStringMap<string> | Record<string, string> = {},
    components: WritableStringMap<ElementDef> | Record<string, ElementDef> = {}
  ) {
    this.vars = vars instanceof WritableStringMap
      ? vars : new WritableStringMap(vars);
    this.components = components instanceof WritableStringMap
      ? components : new WritableStringMap(components);
  }
}