import { Destroyable } from '../util';
import { Definition, Sources } from '../definitions';
import { ComputedStringMap, MappedStringMap } from '../data/StringMap';
import { Page } from './HTML';
import { Sheet } from './CSS';
import { exportResults } from '../serialization/out';

export class Results implements Destroyable {
  public readonly pages: ComputedStringMap<Page>;
  public readonly styles: Sheet;

  public constructor(sources: Sources) {
    this.pages = new MappedStringMap(
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