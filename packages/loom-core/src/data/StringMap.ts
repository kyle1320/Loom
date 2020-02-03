import { EventEmitter, PlainEmitter } from '../util/EventEmitter';
import { Destroyable, mapRecord } from '../util';

export namespace StringMap {
  export type Events<T> = {
    'set': { key: string; value: T };
    'delete': string;
  }
}

type KeyCallback<T, K extends string> =
  (value: T | undefined, key: K) => void;

export class StringMap<T> extends EventEmitter<StringMap.Events<T>> {
  private readonly keyListeners:
  PlainEmitter<Record<string, T | undefined>> = new PlainEmitter();

  public constructor(
    protected readonly data: Record<string, T> = {}
  ) {
    super();
  }

  public get(key: string): T | undefined {
    return this.data[key];
  }

  public has(key: string): boolean {
    return key in this.data;
  }

  public *keys(): IterableIterator<string> {
    for (const key in this.data) {
      yield key;
    }
  }

  protected set(key: string, value: T): void {
    if (this.data[key] !== value) {
      this.data[key] = value;
      this.emit('set', { key, value });
      this.keyListeners.emit(key, value);
    }
  }

  protected delete(key: string): T {
    const value = this.data[key];
    if (key in this.data) {
      delete this.data[key];
      this.emit('delete', key);
      this.keyListeners.emit(key, undefined);
    }
    return value;
  }

  public asRecord(): Readonly<Record<string, T>> {
    return this.data;
  }

  public onKey(key: string, callback: KeyCallback<T, typeof key>): this {
    this.keyListeners.on(key, callback);
    return this;
  }

  public offKey(key: string, callback: KeyCallback<T, typeof key>): this {
    this.keyListeners.off(key, callback);
    return this;
  }

  public map<U>(
    transform: (val: T, key: string, oldValue?: U) => U,
    cleanup?: (val: U) => void
  ): ComputedStringMap<U> {
    return new MappedStringMap(this, transform, cleanup);
  }
}

export class WritableStringMap<T> extends StringMap<T> {
  public set(key: string, value: T): void {
    super.set(key, value);
  }

  public delete(key: string): T {
    return super.delete(key);
  }
}

export abstract class ComputedStringMap<T>
  extends StringMap<T>
  implements Destroyable {

  public abstract destroy(): void;
}

class MappedStringMap<T, U> extends ComputedStringMap<U> {
  public constructor(
    private readonly source: StringMap<T>,
    private readonly transform: (val: T, key: string, oldValue?: U) => U,
    private readonly cleanup?: (val: U) => void
  ) {
    super(mapRecord(source.asRecord(), transform));

    source.on('set', this.sourceSet);
    source.on('delete', this.sourceDelete);
  }

  private sourceSet = (
    { key, value }: { key: string; value: T }
  ): void => {
    const oldValue = this.get(key);
    const newValue = this.transform(value, key, this.data[key]);
    if (this.cleanup && oldValue && newValue !== oldValue) {
      this.cleanup(oldValue);
    }
    this.set(key, newValue);
  }

  private sourceDelete = (key: string): void => {
    if (key in this.data) {
      this.cleanup && this.cleanup(this.data[key]);
    }
    this.delete(key);
  }

  public destroy(): void {
    this.source.off('set', this.sourceSet);
    this.source.off('delete', this.sourceDelete);
    if (this.cleanup) {
      for (const key in this.data) {
        this.cleanup(this.data[key]);
      }
    }
    this.allOff();
  }
}