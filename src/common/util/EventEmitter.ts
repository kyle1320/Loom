type Callback<T> = T extends void ? () => void : (arg: T) => void;

type VoidTypes<T, K extends keyof T = keyof T> =
  K extends (T[K] extends void ? K : never) ? K : never;
type NonVoidTypes<T, K extends keyof T = keyof T> =
  T[K] extends void ? never : K;
type Listeners<T> = {[K in keyof T]?: ((arg: T) => void)[]};

/* eslint-disable @typescript-eslint/no-explicit-any */
export default class EventEmitter<T extends {[name: string]: any}> {
  private _listeners: Listeners<T>;

  public constructor() {
    this._listeners = {};
  }

  public on<K extends keyof T>(type: K, callback: Callback<T[K]>): this {
    let registered = this._listeners[type];

    if (!registered) {
      registered = [] as Listeners<T>[K];
      this._listeners[type] = registered;
    }

    registered!.push(callback);

    return this;
  }

  protected emit<K extends NonVoidTypes<T>>(type: K, arg: T[K]): this;
  protected emit<K extends VoidTypes<T>>(type: K): this;
  protected emit<K extends keyof T>(type: K, arg?: T[K]): this {
    const registered = this._listeners[type];

    if (registered) {
      registered.forEach((cb: (arg: T) => void) => cb.call(this, arg!));
    }

    return this;
  }

  public removeListener<K extends keyof T>(
    type: K,
    callback: Callback<T[K]>
  ): this {
    const registered = this._listeners[type];

    if (registered) {
      const index = registered.indexOf(callback);

      if (index >= 0) {
        registered.splice(index, 1);
      }
    }

    return this;
  }
}