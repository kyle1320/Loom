import Dictionary from './Dictionary';

class WritableDictionary<T> extends Dictionary<T> {}
interface WritableDictionary<T> {
  set(key: string, value: T): string;
  delete(key: string): T | undefined;
  changeKey(oldKey: string, newKey: string): string | false;
}

export default WritableDictionary;