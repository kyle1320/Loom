import WritableDictionary from './WritableDictionary';
import { WritableValue, Value } from '../Value';

export default class DictionaryValue<T> extends WritableValue<T | undefined> {
  public constructor(
    public readonly map: WritableDictionary<T>,
    private readonly key: Value<string>
  ) {
    super(undefined);

    this.destroy.do(key.watch(key => this.map.watchKey(key, {
      change: val => super.set(val)
    })));
  }

  public set = (value: T): boolean => {
    if (super.set(value)) {
      this.map.set(this.key.get(), value);
      return true;
    }
    return false;
  }
}