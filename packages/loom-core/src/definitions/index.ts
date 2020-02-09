import { ElementDef, PageDef } from './HTML';
import { BuildResult, Results } from '../build';
import { WritableStringMap } from '../data/StringMap';
import { SheetDef } from './CSS';
import { saveSources } from '../serialization/out';
import { importSources } from '../serialization/in';

export interface Definition {
  serialize(): string;
  build(sources: Sources): BuildResult<Definition>;
}

export interface SourcesConfig {
  rootDir: string;
  sourcesRoot: string;
  componentsRoot: string;
}

export class Sources {
  public readonly vars: WritableStringMap<string>;
  public readonly components: WritableStringMap<ElementDef>;
  public readonly pages: WritableStringMap<PageDef>;
  public readonly styles: SheetDef;

  public constructor(
    public config: SourcesConfig | null,
    vars: WritableStringMap<string> | Record<string, string> = {},
    components: WritableStringMap<ElementDef> | Record<string, ElementDef> = {},
    pages: WritableStringMap<PageDef> | Record<string, PageDef> = {}
  ) {
    this.vars = vars instanceof WritableStringMap
      ? vars : new WritableStringMap(vars);
    this.components = components instanceof WritableStringMap
      ? components : new WritableStringMap(components);
    this.pages = pages instanceof WritableStringMap
      ? pages : new WritableStringMap(pages);
    this.styles = new SheetDef([]);
  }

  public build(): Results {
    return new Results(this);
  }

  public saveTo(rootDir?: string): void {
    if (!this.config) {
      if (typeof rootDir === 'undefined') {
        throw new Error(
          'Sources must either have config, or rootDir must be supplied'
        );
      }

      this.config = {
        rootDir, sourcesRoot: 'src', componentsRoot: 'components'
      };
    }
    saveSources(this, this.config);
  }

  public static loadFrom(rootDir: string): Sources {
    return importSources(rootDir);
  }
}