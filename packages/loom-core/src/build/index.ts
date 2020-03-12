import { Dictionary, MappedDictionary, Destroyable } from 'loom-data';

import { Definition, Sources } from '../definitions';
import { Page } from './HTML';
import { Sheet } from './CSS';
import { exportResults } from '../serialization/out';
import { PageDef } from '../definitions/HTML';

export class Results implements Destroyable {
  public readonly pages: Dictionary<Page>;
  public readonly styles: Sheet;
  public readonly destroy = Destroyable.make();

  public constructor(sources: Sources) {
    this.destroy.do(
      this.pages = new MappedDictionary<PageDef, Page>(
        sources.pages, x => x.build(sources), x => x.destroy()
      ),
      this.styles = sources.styles.build(sources)
    );
  }

  public exportTo(dir: string): void {
    exportResults(this, dir);
  }
}

export interface BuildResult<D extends Definition> extends Destroyable {
  readonly source: D;
  readonly sources: Sources;

  serialize(): string;
}