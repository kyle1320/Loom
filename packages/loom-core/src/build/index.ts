import {
  MappedStringMap,
  ComputedStringMap } from 'loom-data';

import { Definition, Sources } from '../definitions';
import { Page } from './HTML';
import { Sheet } from './CSS';
import { exportResults } from '../serialization/out';
import { PageDef } from '../definitions/HTML';

export class Results {
  public readonly pages: ComputedStringMap<Page>;
  public readonly styles: Sheet;

  public constructor(sources: Sources) {
    this.pages = new MappedStringMap<PageDef, Page>(
      sources.pages, x => x.build(sources), x => x.destroy()
    );
    this.styles = sources.styles.build(sources);
  }

  public destroy(): void {
    this.pages.destroy();
    this.styles.destroy();
  }

  public exportTo(dir: string): void {
    exportResults(this, dir);
  }
}

export interface BuildResult<D extends Definition> {
  readonly source: D;
  readonly sources: Sources;

  serialize(): string;
  destroy(): void;
}