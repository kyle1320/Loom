import { WritableDictionary } from 'loom-data';

import { ElementDef, PageDef } from './HTML';
import { BuildResult, Results } from '../build';
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
  public readonly components: WritableDictionary<ElementDef>;
  public readonly pages: WritableDictionary<PageDef>;
  public readonly styles: SheetDef;

  public constructor(
    public config: SourcesConfig | null,
    components: WritableDictionary<ElementDef> | Record<string, ElementDef>
    = {},
    pages: WritableDictionary<PageDef> | Record<string, PageDef> = {}
  ) {
    this.components = components instanceof WritableDictionary
      ? components : new WritableDictionary(components);
    this.pages = pages instanceof WritableDictionary
      ? pages : new WritableDictionary(pages);
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