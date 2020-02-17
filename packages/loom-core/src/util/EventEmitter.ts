type Callback<T, K extends keyof T> = (arg: T[K], event: K) => unknown;
type Listeners<T> = { [K in keyof T]?: Set<Callback<T, K>> };

type VoidKeys<T, K extends keyof T = keyof T> =
  K extends (T[K] extends void ? K : never) ? K : never;

export class EventEmitter<T extends {}> {
  private _listeners: Listeners<T> = {};

  public on<K extends keyof T>(type: K, callback: Callback<T, K>): this {
    let registered = this._listeners[type];

    if (!registered) {
      registered = new Set() as Listeners<T>[K];
      this._listeners[type] = registered;
    }

    registered!.add(callback);

    return this;
  }

  public onOff<K extends keyof T>(
    type: K,
    callback: Callback<T, K>
  ): () => void {
    this.on(type, callback);

    // return a cleanup function to remove the listener
    return () => this.off(type, callback);
  }

  protected emit<K extends VoidKeys<T>>(type: K): this;
  protected emit<K extends keyof T>(type: K, arg: T[K]): this;
  protected emit<K extends keyof T>(type: K, arg?: T[K]): this {
    const registered = this._listeners[type];

    if (registered) {
      // "save" the current listeners so that modifications to the listeners
      // inside of callbacks does not affect this emit
      [...registered.values()].forEach(cb => cb.call(this, arg!, type));
    }

    return this;
  }

  public off<K extends keyof T>(type: K, callback: Callback<T, K>): this {
    const registered = this._listeners[type];

    if (registered) {
      registered.delete(callback);
      // TODO: maybe delete if empty?
    }

    return this;
  }

  protected allOff(): this {
    this._listeners = {};
    return this;
  }
}

export class PlainEmitter<T extends {}> extends EventEmitter<T> {
  public emit<K extends VoidKeys<T>>(type: K): this;
  public emit<K extends keyof T>(type: K, arg: T[K]): this;
  public emit<K extends keyof T>(type: K, arg?: T[K]): this {
    super.emit(type, arg!);
    return this;
  }
}