import Dictionary from './Dictionary';
import { ComputedList } from '../List';

export default class DictionaryKeys<T> extends ComputedList<string> {
  public destroy: () => void;

  public constructor(source: Dictionary<T>) {
    super([]);

    this.destroy = source.watch({
      'add': k => this.add(k),
      'delete': k => this.remove(k)
    });
  }
}