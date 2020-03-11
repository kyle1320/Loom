import { EventEmitter, PlainEmitter } from '../EventEmitter';
import { mapRecordKeys, doAll } from '../../util';

namespace Dictionary {
  export interface Listeners<T> {
    /** Additions / updates / deletions, including moves */
    change: (
      key: string,
      value: T | undefined,
      oldValue: T | undefined
    ) => void;

    /** Additions / updates, including moves */
    set: (key: string, value: T, oldValue: T | undefined) => void;

    /** Additions only, including moves */
    add: (key: string, value: T) => void;

    /** Deletions only, including moves */
    delete: (key: string, value: T) => void;

    /** Updates only */
    update: (key: string, value: T, oldValue: T) => void;

    /** Changes to existing keys */
    move: (key: string, newKey: string, value: T) => void;

    /** Additions only, excluding moves */
    addRow: (key: string, value: T) => void;

    /** Deletions only, excluding moves */
    deleteRow: (key: string, value: T) => void;
  }

  export type Events<T> = {
    [k in keyof Listeners<T>]:
    Listeners<T>[k] extends (...args: infer A) => void ? A : never
  }

  export type KeyListeners<T> = {
    [k in keyof Listeners<T>]:
    Listeners<T>[k] extends (key: string, ...args: infer A) => void
      ? (...args: A) => void : never
  };

  export type KeyEvents<T> = {
    [k in keyof KeyListeners<T>]:
    KeyListeners<T>[k] extends (...args: infer A) => void ? A : never
  };

  type Expect<T, K> = {
    [k in keyof T]?: k extends K ? T[k] : undefined
  }

  export type CheckedListeners<T> =
    Expect<Listeners<T>, 'change'> |
    Expect<Listeners<T>, 'set' | 'delete'> |
    Expect<Listeners<T>, 'add' | 'update' | 'delete'> |
    Expect<Listeners<T>, 'addRow' | 'move' | 'update' | 'deleteRow'> |
    Listeners<T>

  export type CheckedKeyListeners<T> =
    Expect<KeyListeners<T>, 'change'> |
    Expect<KeyListeners<T>, 'set' | 'delete'> |
    Expect<KeyListeners<T>, 'add' | 'update' | 'delete'> |
    Expect<KeyListeners<T>, 'addRow' | 'move' | 'update' | 'deleteRow'> |
    KeyListeners<T>
}

class Dictionary<T> extends EventEmitter<Dictionary.Events<T>> {
  protected readonly data: Record<string, T> = {};

  private readonly keyListeners: {
    [k in keyof Dictionary.KeyEvents<T>]:
    PlainEmitter<Record<string, Dictionary.KeyEvents<T>[k]>>
  } = {
    change: new PlainEmitter(),
    set: new PlainEmitter(),
    add: new PlainEmitter(),
    delete: new PlainEmitter(),
    update: new PlainEmitter(),
    move: new PlainEmitter(),
    addRow: new PlainEmitter(),
    deleteRow: new PlainEmitter()
  };

  public constructor(
    data?: Record<string, T>,
    public readonly normalizeKey = (key: string) => key.toLowerCase()
  ) {
    super();

    if (data) this.data = mapRecordKeys(data, normalizeKey);

    this.watch({
      change: this.keyListeners.change.emit.bind(this.keyListeners.change),
      set: this.keyListeners.set.emit.bind(this.keyListeners.set),
      add: this.keyListeners.add.emit.bind(this.keyListeners.add),
      move: this.keyListeners.move.emit.bind(this.keyListeners.move),
      update: this.keyListeners.update.emit.bind(this.keyListeners.update),
      delete: this.keyListeners.delete.emit.bind(this.keyListeners.delete),
      addRow: this.keyListeners.addRow.emit.bind(this.keyListeners.addRow),
      deleteRow:
        this.keyListeners.deleteRow.emit.bind(this.keyListeners.deleteRow),
    });
    this.watch({
      move: (key, newKey, value) => {
        this.emit('delete', key, value);
        this.emit('change', key, undefined, value);
        this.emit('add', newKey, value);
        this.emit('set', newKey, value, undefined);
        this.emit('change', newKey, value, undefined);
      },
      update: (key, value, oldValue) => {
        this.emit('set', key, value, oldValue);
        this.emit('change', key, value, oldValue);
      },
      addRow: (key, value) => {
        this.emit('add', key, value);
        this.emit('set', key, value, undefined);
        this.emit('change', key, value, undefined);
      },
      deleteRow: (key, value) => {
        this.emit('delete', key, value);
        this.emit('change', key, undefined, value);
      }
    });
  }

  public get(key: string): T | undefined {
    return this.data[this.normalizeKey(key)];
  }

  public has(key: string): boolean {
    return this.normalizeKey(key) in this.data;
  }

  public *keys(): IterableIterator<string> {
    for (const key in this.data) {
      yield key;
    }
  }

  protected set(key: string, value: T): string {
    key = this.normalizeKey(key);

    const oldValue = this.data[key] as T | undefined;
    if (oldValue !== value) {
      this.data[key] = value;
      if (typeof oldValue === 'undefined') {
        this.emit('addRow', key, value);
      } else {
        this.emit('update', key, value, oldValue);
      }
    }

    return key;
  }

  protected changeKey(oldKey: string, newKey: string): string | false {
    oldKey = this.normalizeKey(oldKey);
    newKey = this.normalizeKey(newKey);

    if (newKey in this.data) return false;

    if (oldKey in this.data) {
      const value = this.data[oldKey];
      delete this.data[oldKey];
      this.data[newKey] = value;
      this.emit('move', oldKey, newKey, value);
    }

    return newKey;
  }

  protected delete(key: string): T | undefined {
    key = this.normalizeKey(key);

    const value = this.data[key];
    if (key in this.data) {
      delete this.data[key];
      this.emit('deleteRow', key, value);
    }

    return value;
  }

  public asRecord(): Readonly<Record<string, T>> {
    return this.data;
  }

  public watch(ls: Dictionary.CheckedListeners<T>): () => void {
    for (const key in this.data) {
      ls.change && ls.change(key, this.data[key], undefined);
      ls.add && ls.add(key, this.data[key]);
      ls.set && ls.set(key, this.data[key], undefined);
      ls.addRow && ls.addRow(key, this.data[key]);
    }
    return doAll(
      ls.change && this.onOff('change', ls.change),
      ls.add && this.onOff('add', ls.add),
      ls.set && this.onOff('set', ls.set),
      ls.move && this.onOff('move', ls.move),
      ls.update && this.onOff('update', ls.update),
      ls.delete && this.onOff('delete', ls.delete),
      ls.addRow && this.onOff('addRow', ls.addRow),
      ls.deleteRow && this.onOff('deleteRow', ls.deleteRow),
    );
  }

  public watchKey(
    key: string,
    ls: Dictionary.CheckedKeyListeners<T>
  ): () => void {
    key = this.normalizeKey(key);

    ls.change && ls.change(this.data[key], undefined);
    if (key in this.data) {
      ls.add && ls.add(this.data[key]);
      ls.set && ls.set(this.data[key], undefined);
      ls.addRow && ls.addRow(this.data[key]);
    }
    return doAll(
      ls.change && this.keyListeners.change.onOff(key, ls.change),
      ls.add && this.keyListeners.add.onOff(key, ls.add),
      ls.set && this.keyListeners.set.onOff(key, ls.set),
      ls.move && this.keyListeners.move.onOff(key, ls.move),
      ls.update && this.keyListeners.update.onOff(key, ls.update),
      ls.delete && this.keyListeners.delete.onOff(key, ls.delete),
      ls.addRow && this.keyListeners.addRow.onOff(key, ls.addRow),
      ls.deleteRow && this.keyListeners.deleteRow.onOff(key, ls.deleteRow),
    );
  }
}

export default Dictionary;