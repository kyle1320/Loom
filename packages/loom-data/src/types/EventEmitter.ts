type AsArray<T> = T extends unknown[] ? T : [T];
type Callback<T, K extends keyof T> = (...args: AsArray<T[K]>) => unknown
type Listeners<T> = { [K in keyof T]?: Set<Callback<T, K>> };

export class EventEmitter<T> {
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

  protected emit<K extends keyof T>(type: K, ...args: AsArray<T[K]>): this {
    const registered = this._listeners[type];

    if (registered) {
      // "save" the current listeners so that modifications to the listeners
      // inside of callbacks does not affect this emit
      [...registered.values()].forEach(cb => cb.apply(this, args));
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

export class PlainEmitter<T> extends EventEmitter<T> {
  public emit<K extends keyof T>(type: K, ...args: AsArray<T[K]>): this {
    return super.emit(type, ...args);
  }
}