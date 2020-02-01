import { Destroyable } from '../util';
import { Definition, Sources } from '../definitions';
import { EventEmitter } from '../util/EventEmitter';
import { StringMap } from '../data/StringMap';

export abstract class BuildResult<D extends Definition, E = unknown>
  extends EventEmitter<E>
  implements Destroyable {

  private unlisteners: Set<() => void> = new Set();

  public constructor(
    public readonly source: D,
    public readonly sources: Sources
  ) {
    super();
  }

  public abstract serialize(): string;

  protected listen<E, K extends keyof E>(
    data: EventEmitter<E>,
    event: K,
    cb: (data: E[K], event: K) => void
  ): () => void {
    data.on(event, cb);
    const remove = (): void => {
      if (this.unlisteners.delete(remove)) {
        data.off(event, cb);
      }
    }
    this.unlisteners.add(remove);
    return remove;
  }

  public destroy(): void {
    this.allOff();
    this.unlisteners.forEach(cb => cb());
  }
}

export class InterpolatedString
  extends EventEmitter<{ 'change': string }>
  implements Destroyable {

  private _interpolated!: string;

  public constructor(
    private _value: string,
    private readonly vars: StringMap<string>
  ) {
    super();

    this.interpolate();
  }

  public get value(): string {
    return this._interpolated;
  }

  public set value(value: string) {
    if (this._value !== value) {
      this.destroyValueListeners();
      this._value = value;
      this.interpolate();
    }
  }

  private interpolate = (): void => {
    const interpolated = this._value.replace(/{{(\S+)}}/, (_, s) => {
      this.vars.onKey(s, this.interpolate);
      const val = this.vars.get(s);
      if (val) return val;
      return s; // TODO: throw error?
    });

    if (this._interpolated !== interpolated) {
      this._interpolated = interpolated;
      this.emit('change', interpolated);
    }
  }

  private destroyValueListeners(): void {
    this._value.replace(/{{(\S+)}}/, (_, s) => {
      this.vars.offKey(s, this.interpolate);
      return s;
    });
  }

  public destroy(): void {
    this.allOff();
    this.destroyValueListeners();
  }
}