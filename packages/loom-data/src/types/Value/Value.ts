import { EventEmitter } from '../EventEmitter';

namespace Value {
  export type Events<T> = {
    'change': [T, T];
  }
}

class Value<T> extends EventEmitter<Value.Events<T>> {
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

  // onChange can return a "cleanup" callback that will be called
  // when a new change happens and before onChange is re-called
  public watch(
    onChange: (value: T, oldValue: T | undefined) => (() => void) | null | void
  ): () => void {
    let cleanup = onChange(this._value, undefined);
    const off = this.onOff('change', (value: T, oldValue: T | undefined) => {
      typeof cleanup === 'function' && cleanup();
      cleanup = onChange(value, oldValue);
    });
    return () => {
      typeof cleanup === 'function' && cleanup();
      off();
    };
  }
}

export default Value;