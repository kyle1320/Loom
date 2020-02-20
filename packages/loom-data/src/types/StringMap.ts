import { EventEmitter, PlainEmitter } from './EventEmitter';
import { mapRecordKeys, doAll, Destroyable } from '../util';
import { Value, WritableValue } from './Value';

export namespace StringMap {
  export type Events<T> = {
    // "primitive" events
    'set': [string, T, T | undefined];
    'delete': [string, T];

    // "row-based" events
    'addRow': [string, T];
    'deleteRow': [string, T];
    'changeKey': [string, string, T];
    'changeValue': [string, T, T];
  }
}

export class StringMap<T> extends EventEmitter<StringMap.Events<T>> {
  protected readonly data: Record<string, T> = {};

  // per-key key change listeners
  public readonly keyChanges:
  PlainEmitter<Record<string, [string, T]>> = new PlainEmitter();

  // per-key value change listeners
  public readonly valueChanges:
  PlainEmitter<Record<string, [T | undefined, T | undefined]>>
  = new PlainEmitter();

  public constructor(
    data?: Record<string, T>,
    public readonly normalizeKey = (key: string) => key.toLowerCase()
  ) {
    super();

    if (data) this.data = mapRecordKeys(data, normalizeKey);
  }

  public get(key: string): T | undefined {
    return this.data[this.normalizeKey(key)];
  }

  public has(key: string): boolean {
    return this.normalizeKey(key) in this.data;
  }

  public *keys(): IterableIterator<string> {
    for (const key in this.data) {
      yield key;
    }
  }

  protected set(key: string, value: T): string {
    key = this.normalizeKey(key);

    const oldValue = this.data[key] as T | undefined;
    if (oldValue !== value) {
      this.data[key] = value;
      this.emit('set', key, value, oldValue);
      if (typeof oldValue === 'undefined') {
        this.emit('addRow', key, value);
      } else {
        this.emit('changeValue', key, value, oldValue);
      }
      this.valueChanges.emit(key, value, oldValue);
    }

    return key;
  }

  protected changeKey(oldKey: string, newKey: string): string | null {
    oldKey = this.normalizeKey(oldKey);
    newKey = this.normalizeKey(newKey);

    if (oldKey in this.data && !(newKey in this.data)) {
      const value = this.data[oldKey];
      delete this.data[oldKey];
      this.emit('delete', oldKey, value);
      this.data[newKey] = value;
      this.emit('set', newKey, value, undefined);
      this.emit('changeKey', oldKey, newKey, value);
      this.keyChanges.emit(oldKey, newKey, value);
      return newKey;
    }

    return null;
  }

  protected delete(key: string): T | undefined {
    key = this.normalizeKey(key);

    const value = this.data[key];
    if (key in this.data) {
      delete this.data[key];
      this.emit('delete', key, value);
      this.emit('deleteRow', key, value);
      this.valueChanges.emit(key, undefined, value);
    }

    return value;
  }

  public asRecord(): Readonly<Record<string, T>> {
    return this.data;
  }

  public watch(
    onSet: (key: string, value: T, oldValue: T | undefined) => void,
    onDelete: (data: string, value: T) => void
  ): () => void {
    for (const key in this.data) {
      onSet(key, this.data[key], undefined);
    }
    return doAll(
      this.onOff('set', onSet),
      this.onOff('delete', onDelete)
    );
  }

  public watchRows(
    onAdd: (key: string, value: T) => void,
    onDelete: (data: string, value: T) => void,
    onChangeKey?: (oldKey: string, newKey: string, value: T) => void,
    onChangeValue?: (key: string, value: T, oldValue: T) => void,
  ): () => void {
    for (const key in this.data) {
      onAdd(key, this.data[key]);
    }
    return doAll(
      this.onOff('addRow', onAdd),
      this.onOff('deleteRow', onDelete),
      onChangeKey && this.onOff('changeKey', onChangeKey),
      onChangeValue && this.onOff('changeValue', onChangeValue)
    );
  }
}

export class StringMapRow<T> {
  public readonly key: StringMapKey<T>;
  public readonly value: StringMapValue<T>;

  public constructor(map: WritableStringMap<T>, key: string) {
    this.key = new StringMapKey(map, key);
    this.value = new StringMapValue(map, this.key);
  }

  public destroy(): void {
    this.key.destroy();
    this.value.destroy();
  }
}

export class StringMapKey<T> extends WritableValue<string> {
  public constructor(
    public readonly map: WritableStringMap<T>,
    key: string
  ) {
    super(key = map.normalizeKey(key));
    map.keyChanges.on(key, super.set);
  }

  public set(key: string): boolean {
    const oldKey = this.get();
    const res = this.map.changeKey(oldKey, key);
    return res !== null && super.set(res);
  }

  public destroy(): void {
    this.map.keyChanges.off(this.get(), super.set);
  }
}

export class StringMapValue<T> extends WritableValue<T | undefined> {
  public constructor(
    public readonly map: WritableStringMap<T>,
    private readonly key: Value<string>
  ) {
    super(null!);

    key.watch(this.updateKey);
  }

  public set = (value: T): boolean => {
    if (super.set(value)) {
      this.map.set(this.key.get(), value);
      return true;
    }
    return false;
  }

  public destroy(): void {
    this.map.valueChanges.off(this.key.get(), super.set);
    this.key.off('change', this.updateKey);
    this.allOff();
  }

  private updateKey = (key: string, oldKey: string | undefined): void => {
    oldKey && this.map.valueChanges.off(oldKey, super.set);
    super.set(this.map.get(key));
    this.map.valueChanges.on(key, super.set);
  }
}

export class WritableStringMap<T> extends StringMap<T> {
  public set(key: string, value: T): string {
    return super.set(key, value);
  }

  public delete(key: string): T | undefined {
    return super.delete(key);
  }

  public changeKey(oldKey: string, newKey: string): string | null {
    return super.changeKey(oldKey, newKey);
  }
}

export abstract class ComputedStringMap<T>
  extends StringMap<T>
  implements Destroyable {

  public abstract destroy(): void;
}

export class MappedStringMap<T, U> extends ComputedStringMap<U> {
  private unwatch: () => void;

  public constructor(
    sourceMap: StringMap<T>,
    transform: (val: T, key: string, oldValue?: U) => U,
    private readonly cleanup: (val: U) => void
  ) {
    super();

    this.unwatch = sourceMap.watchRows(
      (key, value) => this.set(key, transform(value, key, undefined)),
      key => this.cleanup(this.delete(key)!),
      (oldKey, newKey) => this.changeKey(oldKey, newKey),
      (key, value) => {
        const oldValue = this.data[key];
        this.cleanup(oldValue);
        this.set(key, transform(value, key, oldValue));
      }
    );
  }

  public destroy(): void {
    this.unwatch();
    for (const key in this.data) {
      this.cleanup(this.data[key]);
    }
    this.allOff();
  }
}