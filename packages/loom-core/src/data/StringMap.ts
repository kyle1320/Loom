import { EventEmitter, PlainEmitter } from '../util/EventEmitter';
import { mapRecordKeys, doAll, Destroyable } from '../util';

export namespace StringMap {
  export type Events<T> = {
    'set': [string, T, T | undefined];
    'delete': [string, T];
  }
}

type KeyCallback<T> = (value: T | undefined) => void;

export class StringMap<T> extends EventEmitter<StringMap.Events<T>> {
  protected readonly data: Record<string, T> = {};
  private readonly keyListeners:
  PlainEmitter<Record<string, [T | undefined]>> = new PlainEmitter();

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

    const oldValue = this.data[key];
    if (this.data[key] !== value) {
      this.data[key] = value;
      this.emit('set', key, value, oldValue);
      this.keyListeners.emit(key, value);
    }

    return key;
  }

  protected delete(key: string): T {
    key = this.normalizeKey(key);

    const value = this.data[key];
    if (key in this.data) {
      delete this.data[key];
      this.emit('delete', key, value);
      this.keyListeners.emit(key, undefined);
    }
    return value;
  }

  public asRecord(): Readonly<Record<string, T>> {
    return this.data;
  }

  public onKey(key: string, callback: KeyCallback<T>): () => void {
    key = this.normalizeKey(key);

    this.keyListeners.on(key, callback);

    return () => this.keyListeners.off(key, callback);
  }

  public offKey(key: string, callback: KeyCallback<T>): void {
    key = this.normalizeKey(key);

    this.keyListeners.off(key, callback);
  }

  public watch(
    onSet: (key: string, value: T, oldValue?: T) => void,
    onDelete: (data: string) => void
  ): () => void {
    for (const key in this.data) {
      onSet(key, this.data[key]);
    }
    return doAll(
      this.onOff('set', onSet),
      this.onOff('delete', onDelete)
    );
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

export class MappedStringMap<T, U> extends ComputedStringMap<U> {
  public constructor(
    private readonly sourceMap: StringMap<T>,
    private readonly onUpdate: (val: T, key: string, oldValue?: U) => U,
    private readonly cleanup: (val: U) => void
  ) {
    super();

    sourceMap.watch(this.sourceSet, this.sourceDelete);
  }

  private sourceSet = (key: string, value: T): void => {
    const oldValue = this.get(key);
    const newValue = this.onUpdate(value, key, oldValue);
    if (oldValue && newValue !== oldValue) {
      this.cleanup(oldValue);
    }
    this.set(key, newValue);
  }

  private sourceDelete = (key: string): void => {
    this.cleanup(this.data[key]);
    this.delete(key);
  }

  public destroy(): void {
    this.sourceMap.off('set', this.sourceSet);
    this.sourceMap.off('delete', this.sourceDelete);
    for (const key in this.data) {
      this.cleanup(this.data[key]);
    }
    this.allOff();
  }
}