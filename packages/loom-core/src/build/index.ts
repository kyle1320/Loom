import { Destroyable } from '../util';
import { Definition, Sources } from '../definitions';
import {
  StringMap,
  ComputedStringMap,
  MappedStringMap } from '../data/StringMap';
import { Page } from './HTML';
import { Sheet } from './CSS';
import { exportResults } from '../serialization/out';
import { Value } from '../data/Value';

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

export class InterpolatedString
  extends Value<string>
  implements Destroyable {

  private unlisteners: (() => void)[] = [];

  public constructor(
    value: string,
    private readonly vars: StringMap<string>
  ) {
    super('');

    this.update(value);
  }

  public update = (value: string): void => {
    this.destroyValueListeners();
    this.set(value.replace(/{{(\S+)}}/, (_, s) => {
      this.unlisteners.push(this.vars.onKey(s, this.update.bind(this, value)));
      const val = this.vars.get(s);
      if (val) return val;
      return s; // TODO: throw error?
    }));
  }

  private destroyValueListeners(): void {
    this.unlisteners.forEach(cb => cb());
    this.unlisteners = [];
  }

  public destroy(): void {
    this.allOff();
    this.destroyValueListeners();
  }
}