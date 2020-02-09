import { EventEmitter, PlainEmitter } from '../util/EventEmitter';
import { Destroyable, mapRecord, mapRecordKeys } from '../util';

export namespace StringMap {
  export type Events<T> = {
    'set': { key: string; value: T };
    'delete': string;
  }
}

type KeyCallback<T, K extends string> =
  (value: T | undefined, key: K) => void;

export class StringMap<T> extends EventEmitter<StringMap.Events<T>> {
  protected readonly data: Record<string, T> = {};
  private readonly keyListeners:
  PlainEmitter<Record<string, T | undefined>> = new PlainEmitter();

  public constructor(
    data?: Record<string, T>,
    public readonly normalizeKey = (key: string) => key.toLowerCase()
  ) {
    super();

    if (data) this.data = mapRecordKeys(data, normalizeKey);
  }

  public get(key: string): T | undefined {
    key = this.normalizeKey(key);

    return this.data[key];
  }

  public has(key: string): boolean {
    key = this.normalizeKey(key);

    return key in this.data;
  }

  public *keys(): IterableIterator<string> {
    for (const key in this.data) {
      yield key;
    }
  }

  protected set(key: string, value: T): string {
    key = this.normalizeKey(key);

    if (this.data[key] !== value) {
      this.data[key] = value;
      this.emit('set', { key, value });
      this.keyListeners.emit(key, value);
    }

    return key;
  }

  protected delete(key: string): T {
    key = this.normalizeKey(key);

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
    key = this.normalizeKey(key);

    this.keyListeners.on(key, callback);
    return this;
  }

  public offKey(key: string, callback: KeyCallback<T, typeof key>): this {
    key = this.normalizeKey(key);

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
  public set(key: string, value: T): string {
    return super.set(key, value);
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