type Callback<T> = T extends void ? () => void : (arg: T) => void;

type VoidTypes<T, K extends keyof T = keyof T> =
  T[K] extends void ? K : never;
type NonVoidTypes<T, K extends keyof T = keyof T> =
  T[K] extends void ? never : K;
type Listeners<T> = {[K in keyof T]?: ((arg: T) => void)[]};
type QueuedEvents<T> = {
  [K in keyof T]?: (K extends VoidTypes<T> ? undefined : T[K])
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export default class EventEmitter<T extends {[name: string]: any}> {
  private _listeners: Listeners<T>;

  private _queued: QueuedEvents<T>;
  private _timeout: NodeJS.Timer | null;

  public constructor() {
    this._listeners = {};
    this._queued = {};
    this._timeout = null;
  }

  public on<K extends keyof T>(type: K, callback: Callback<T[K]>): void {
    let registered = this._listeners[type];

    if (!registered) {
      registered = [] as Listeners<T>[K];
      this._listeners[type] = registered;
    }

    registered!.push(callback);
  }

  protected emit<K extends NonVoidTypes<T>>(type: K, arg: T[K]): void;
  protected emit<K extends VoidTypes<T>>(type: K): void;
  protected emit<K extends keyof T>(type: K, arg?: T[K]): void {
    const registered = this._listeners[type];

    if (registered) {
      registered.forEach((cb: (arg: T) => void) => cb.call(this, arg!));
    }
  }

  protected emitOnceAsync<K extends NonVoidTypes<T>>(type: K, arg: T[K]): void;
  protected emitOnceAsync<K extends VoidTypes<T>>(type: K): void;
  protected emitOnceAsync<K extends keyof T>(type: K, arg?: T[K]): void {
    this._queued[type] = arg!;

    if (!this._timeout) {
      this._timeout = setTimeout(() => {
        this._timeout = null;

        const queued = this._queued;
        this._queued = {};

        for (const type in queued) {
          this.emit<any>(type, queued[type]!);
        }
      }, 0);
    }
  }

  public removeListener<K extends keyof T>(
    type: K,
    callback: Callback<T[K]>
  ): void {
    const registered = this._listeners[type];

    if (registered) {
      const index = registered.indexOf(callback);

      if (index >= 0) {
        registered.splice(index, 1);
      }
    }
  }
}