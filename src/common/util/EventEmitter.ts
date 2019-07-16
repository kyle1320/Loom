type Callback<T> = T extends void ? () => any : (arg: T) => any;

type VoidKeys<T, K extends keyof T = keyof T> =
  K extends (T[K] extends void ? K : never) ? K : never;
type Listeners<T> =
  {[name: string]: any} & {[K in keyof T]?: ((arg: T) => any)[]};
type QueuedEvents<T> =
  {[name: string]: any} & {[K in keyof T]?: T[K]};

export default class EventEmitter<
T extends {[name: string]: any},
VoidTypes = VoidKeys<T>,
NonVoidTypes extends Exclude<keyof T, VoidTypes> = Exclude<keyof T, VoidTypes>
> {
  private _listeners: Listeners<T>;

  private _queued: QueuedEvents<T>;
  private _timeout: NodeJS.Timer | null;

  public constructor() {
    this._listeners = {};
    this._queued = {};
    this._timeout = null;
  }

  public on<K extends keyof T>(type: K, callback: Callback<T[K]>) {
    var registered = this._listeners[type];

    if (!registered) {
      registered = [] as Listeners<T>[K];
      this._listeners[type] = registered;
    }

    registered.push(callback);
  }

  public emit<K extends NonVoidTypes>(type: K, arg: T[K]): void;
  public emit<K extends VoidTypes>(type: K): void;
  public emit<K extends keyof T>(type: K, arg?: T[K]): void {
    var registered = this._listeners[type];

    if (registered) {
      registered.forEach((cb: (arg: T) => any) => cb.call(this, arg!));
    }
  }

  public emitOnceAsync<K extends NonVoidTypes>(type: K, arg: T[K]): void;
  public emitOnceAsync<K extends VoidTypes>(type: K): void;
  public emitOnceAsync<K extends keyof T>(type: K, arg?: T[K]): void {
    this._queued[type] = arg!;

    if (!this._timeout) {
      this._timeout = setTimeout(() => {
        this._timeout = null;

        var queued = this._queued;
        this._queued = {};

        for (var type in queued) {
          this.emit(<any>type, queued[type]);
        }
      }, 0);
    }
  }

  public removeListener<K extends keyof T>(type: K, callback: Callback<T[K]>) {
    var registered = this._listeners[type];

    if (registered) {
      var index = registered.indexOf(callback);

      if (index >= 0) {
        registered.splice(index, 1);
      }
    }
  }
}