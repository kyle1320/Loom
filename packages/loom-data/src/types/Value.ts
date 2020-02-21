import { EventEmitter } from './EventEmitter';

export namespace Value {
  export type Events<T> = {
    'change': [T, T];
  }
}

export class Value<T> extends EventEmitter<Value.Events<T>> {
  private _frozen = false;

  public constructor(private _value: T) {
    super();
  }

  public get(): T {
    return this._value;
  }

  protected set(value: T): boolean {
    if (!this._frozen && this._value !== value) {
      const oldValue = this._value;
      this._value = value;
      this.emit('change', value, oldValue);
      return true;
    }
    return false;
  }

  public freeze(): void {
    this._frozen = true;
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

export abstract class ComputedValue<T> extends Value<T> {
  public abstract destroy(): void
}

export class MappedValue<T, U> extends ComputedValue<U> {
  public constructor(
    private readonly source: Value<T>,
    private readonly transform: (value: T) => U,
    private readonly cleanup: (value: U) => void
  ) {
    super(transform(source.get()));

    source.on('change', this.update);
  }

  private update = (value: T): void => {
    const oldValue = this.get();
    if (this.set(this.transform(value))) {
      this.cleanup(oldValue);
    }
  }

  public destroy(): void {
    this.source.off('change', this.update);
    this.allOff();
  }
}