import { EventEmitter } from '../util/EventEmitter';
import { WritableStringMap } from './StringMap';

export namespace Value {
  export type Events<T> = {
    'change': [T, T | undefined];
  }
}

export class Value<T> extends EventEmitter<Value.Events<T>> {
  public constructor(private value: T) {
    super();
  }

  public get(): T {
    return this.value;
  }

  protected set(value: T): boolean {
    if (this.value !== value) {
      const oldValue = this.value;
      this.value = value;
      this.emit('change', value, oldValue);
      return true;
    }
    return false;
  }

  public watch(
    onChange: (value: T, oldValue: T | undefined) => void
  ): () => void {
    onChange(this.value, undefined);
    return this.onOff('change', onChange);
  }
}

export class WritableValue<T> extends Value<T> {
  public set(value: T): boolean {
    return super.set(value);
  }
}

export class MapLookupValue<T> extends WritableValue<T | undefined> {
  public constructor(
    private readonly sourceMap: WritableStringMap<T>,
    private key: string
  ) {
    super(sourceMap.get(key));

    sourceMap.onKey(key, this.set);
  }

  public setKey(key: string): string {
    key = this.sourceMap.normalizeKey(key);
    if (key !== this.key) {
      this.sourceMap.offKey(this.key, this.set);
      this.set(this.sourceMap.get(key));
      this.key = key;
      this.sourceMap.onKey(key, this.set);
    }
    return key;
  }

  public set = (value: T | undefined): boolean => {
    if (super.set(value)) {
      if (typeof value === 'undefined') this.delete();
      else this.sourceMap.set(this.key, value);
      return true;
    }
    return false;
  }

  public delete(): void {
    this.sourceMap.delete(this.key);
  }

  public destroy(): void {
    this.sourceMap.offKey(this.key, this.set);
    this.allOff();
  }
}