import WritableDictionary from './WritableDictionary';
import { EventEmitter } from '../EventEmitter';
import { WritableValue } from '../Value';
import { doAll } from '../../util';

export default class DictionaryRow<T> extends EventEmitter<{ delete: void }> {
  public readonly key: WritableValue<string>;
  public readonly value: WritableValue<T>;

  public constructor(
    public readonly map: WritableDictionary<T>,
    key: string,
    defaultValue: T
  ) {
    super();

    key = map.normalizeKey(key);

    const keyVal = this.key = new class extends WritableValue<string> {
      public set(key: string): boolean {
        const oldKey = this.get();
        const res = map.changeKey(oldKey, key);
        return res !== false && super.set(res);
      }

      public update = (key: string): void => {
        super.set(key);
      }
    }(key);
    this.value = new class extends WritableValue<T> {
      public set = (value: T): boolean => {
        if (super.set(value)) {
          const key = keyVal.get();
          map.has(key) && map.set(key, value);
          return true;
        }
        return false;
      }
    }(defaultValue);

    this.destroy.do(keyVal.watch(key => map.watchKey(key, {
      addRow: this.value.set,
      move: keyVal.update,
      update: this.value.set,
      deleteRow: () => this.emit('delete')
    })));
  }

  public exists(): boolean {
    return this.map.has(this.key.get());
  }

  public insert(): void {
    this.map.set(this.key.get(), this.value.get());
  }

  public delete(): void {
    this.map.delete(this.key.get());
  }

  public watch(
    onKeyChange: (key: string, oldKey: string | undefined) => void,
    onValueChange: (value: T, oldValue: T | undefined) => void,
    onDelete: () => void
  ): () => void {
    return doAll(
      this.key.watch(onKeyChange),
      this.value.watch(onValueChange),
      this.onOff('delete', onDelete)
    );
  }
}