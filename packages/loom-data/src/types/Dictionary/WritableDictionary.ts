import Dictionary from './Dictionary';

export default class WritableDictionary<T> extends Dictionary<T> {
  public set(key: string, value: T): string {
    return super.set(key, value);
  }

  public delete(key: string): T | undefined {
    return super.delete(key);
  }

  public changeKey(oldKey: string, newKey: string): string | false {
    return super.changeKey(oldKey, newKey);
  }
}