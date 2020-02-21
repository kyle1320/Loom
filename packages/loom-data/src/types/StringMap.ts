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
  PlainEmitter<Record<string, [string | undefined, T]>> = new PlainEmitter();

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

    this.on('changeKey', this.keyChanges.emit.bind(this.keyChanges));
    this.on('set', this.valueChanges.emit.bind(this.valueChanges));
    this.on('delete', (k, v) => this.valueChanges.emit(k, undefined, v));
    this.on('deleteRow', (k, v) => this.keyChanges.emit(k, undefined, v));
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
    }

    return key;
  }

  protected changeKey(oldKey: string, newKey: string): string | false {
    oldKey = this.normalizeKey(oldKey);
    newKey = this.normalizeKey(newKey);

    if (newKey in this.data) return false;

    if (oldKey in this.data) {
      const value = this.data[oldKey];
      delete this.data[oldKey];
      this.emit('delete', oldKey, value);
      this.data[newKey] = value;
      this.emit('set', newKey, value, undefined);
      this.emit('changeKey', oldKey, newKey, value);
    }

    return newKey;
  }

  protected delete(key: string): T | undefined {
    key = this.normalizeKey(key);

    const value = this.data[key];
    if (key in this.data) {
      delete this.data[key];
      this.emit('delete', key, value);
      this.emit('deleteRow', key, value);
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
    onDelete?: (data: string, value: T) => void,
    onChangeKey?: (oldKey: string, newKey: string, value: T) => void,
    onChangeValue?: (key: string, value: T, oldValue: T) => void,
  ): () => void {
    for (const key in this.data) {
      onAdd(key, this.data[key]);
    }
    return doAll(
      this.onOff('addRow', onAdd),
      onDelete && this.onOff('deleteRow', onDelete),
      onChangeKey && this.onOff('changeKey', onChangeKey),
      onChangeValue && this.onOff('changeValue', onChangeValue)
    );
  }
}

export class StringMapRow<T> extends EventEmitter<{ delete: void }> {
  public readonly key: WritableValue<string>;
  public readonly value: WritableValue<T>;

  public destroy: () => void;

  public constructor(
    public readonly map: WritableStringMap<T>,
    key: string,
    defaultValue: T
  ) {
    super();

    key = map.normalizeKey(key);

    const deleted = (): void => void this.emit('delete');
    const keyVal = this.key = new class extends WritableValue<string> {
      public set(key: string): boolean {
        const oldKey = this.get();
        const res = map.changeKey(oldKey, key);
        return res !== false && super.set(res);
      }

      public update = (key: string | undefined): void => {
        if (typeof key === 'string') super.set(key);
        else deleted();
      }
    }(key);
    const valVal = this.value = new class extends WritableValue<T> {
      public set = (value: T): boolean => {
        if (super.set(value)) {
          const key = keyVal.get();
          map.has(key) && map.set(key, value);
          return true;
        }
        return false;
      }

      public update = (value: T | undefined): void => {
        if (typeof value !== 'undefined') super.set(value);
      }
    }(defaultValue);

    keyVal.watch((key: string, oldKey: string | undefined) => {
      if (typeof oldKey === 'string') {
        map.keyChanges.off(oldKey, keyVal.update);
        map.valueChanges.off(oldKey, valVal.update);
      }
      map.keyChanges.on(key, keyVal.update);
      map.valueChanges.off(key, valVal.update);

      valVal.update(map.get(key));
    });

    this.destroy = (): void => {
      const key = this.key.get();
      map.keyChanges.off(key, keyVal.update);
      map.valueChanges.off(key, valVal.update);
    };
  }

  public exists(): boolean {
    return this.map.has(this.key.get());
  }

  public insert(): void {
    this.map.set(this.key.get(), this.value.get());
  }

  public delete(): void {
    this.map.delete(this.key.get());
  }

  public watch(
    onKeyChange: (key: string, oldKey: string | undefined) => void,
    onValueChange: (value: T, oldValue: T | undefined) => void,
    onDelete: () => void
  ): () => void {
    return doAll(
      this.key.watch(onKeyChange),
      this.value.watch(onValueChange),
      this.onOff('delete', onDelete)
    );
  }
}

export class StringMapValue<T> extends WritableValue<T | undefined> {
  public constructor(
    public readonly map: WritableStringMap<T>,
    private readonly key: Value<string>
  ) {
    super(undefined);

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

  public changeKey(oldKey: string, newKey: string): string | false {
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