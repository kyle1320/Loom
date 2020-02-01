import { EventEmitter, PlainEmitter } from '../util/EventEmitter';

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
}

export class WritableStringMap<T> extends StringMap<T> {
  public set(key: string, value: T): void {
    super.set(key, value);
  }

  public delete(key: string): T {
    return super.delete(key);
  }
}