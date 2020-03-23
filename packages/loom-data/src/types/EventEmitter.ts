import Destroyable from './Destroyable';

type AsArray<T> = T extends unknown[] ? T : [T];
type Callback<T, K extends keyof T> = (...args: AsArray<T[K]>) => unknown
type Listeners<T> = { [K in keyof T]?: Set<Callback<T, K>> };

export class EventEmitter<T> implements Destroyable {
  private _listeners: Listeners<T> = {};
  private _emitting: Partial<Record<keyof T, boolean>> = {};
  public readonly destroy = Destroyable.make(() => this.allOff());

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

  public once<K extends keyof T>(
    type: K,
    callback: Callback<T, K>
  ): () => void {
    const remove = this.onOff(type, doOnce);
    function doOnce(...args: AsArray<T[K]>): void {
      callback(...args);
      remove();
    }
    return remove;
  }

  protected emit<K extends keyof T>(type: K, ...args: AsArray<T[K]>): this {
    const registered = this._listeners[type];
    this._emitting[type] = true;

    if (registered) {
      // "save" the current listeners so that modifications to the listeners
      // inside of callbacks does not affect this emit
      const callbacks = [...registered.values()];
      for (let i = 0; i < callbacks.length; i++) {
        callbacks[i].apply(this, args);

        // if a callback triggered another emit of the same type,
        // or this event was cancelled via stopEmit, stop.
        if (!this._emitting[type]) break;
      }
    }

    this._emitting[type] = false;
    return this;
  }

  protected stopEmit(type: keyof T): void {
    this._emitting[type] = false;
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