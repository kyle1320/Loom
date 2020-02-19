import { EventEmitter } from '../util/EventEmitter';
import { WritableStringMap } from './StringMap';

export namespace Value {
  export type Events<T> = {
    'change': [T, T | undefined];
  }
}

export class Value<T> extends EventEmitter<Value.Events<T>> {
  public constructor(private _value: T) {
    super();
  }

  public get(): T {
    return this._value;
  }

  protected set(value: T): boolean {
    if (this._value !== value) {
      const oldValue = this._value;
      this._value = value;
      this.emit('change', value, oldValue);
      return true;
    }
    return false;
  }

  public watch(
    onChange: (value: T, oldValue: T | undefined) => void
  ): () => void {
    onChange(this._value, undefined);
    return this.onOff('change', onChange);
  }
}

export class WritableValue<T> extends Value<T> {
  public set(value: T): boolean {
    return super.set(value);
  }
}

export class MapKey<T> extends WritableValue<string> {
  public readonly value: MapValue<T>;

  public constructor(
    public readonly map: WritableStringMap<T>,
    key: string
  ) {
    super(key = map.normalizeKey(key));
    this.value = new MapValue(map, this);
  }

  public set(key: string): boolean {
    key = this.map.normalizeKey(key);
    if (!this.map.has(key)) {
      const oldKey = this.get();
      if (super.set(key)) {
        this.map.set(key, this.map.delete(oldKey));
      }
    }
    return false;
  }

  public delete(): void {
    this.map.delete(this.get());
  }

  public destroy(): void {
    this.value.destroy();
  }
}

export class MapValue<T> extends WritableValue<T | undefined> {
  public constructor(
    public readonly map: WritableStringMap<T>,
    private readonly key: string | MapKey<T>
  ) {
    super(undefined);

    if (typeof key === 'string') {
      key = map.normalizeKey(key);
      this.setKey(key, undefined);
    } else {
      key.watch(this.setKey);
    }
  }

  public set = (value: T): boolean => {
    if (super.set(value)) {
      this.map.set(this.getKey(), value);
      return true;
    }
    return false;
  }

  public getKey(): string {
    return typeof this.key === 'string'
      ? this.key
      : this.key.get();
  }

  private setKey = (
    key: string,
    oldKey: string | undefined
  ): void => {
    if (typeof oldKey === 'string') {
      this.map.offKey(oldKey, super.set);
    }
    super.set(this.map.get(key));
    this.map.onKey(key, super.set);
  }

  public delete(): void {
    this.map.delete(this.getKey());
  }

  public destroy(): void {
    if (typeof this.key !== 'string') this.key.off('change', this.setKey);
    this.map.offKey(this.getKey(), super.set);
    this.allOff();
  }
}