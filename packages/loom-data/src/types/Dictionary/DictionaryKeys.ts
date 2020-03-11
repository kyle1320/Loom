import Dictionary from './Dictionary';
import { ComputedList } from '../List';

export default class DictionaryKeys<T> extends ComputedList<string> {
  public destroy: () => void;

  public constructor(source: Dictionary<T>, sort = false) {
    super([]);

    this.destroy = source.watch({
      'add': k => {
        let i = this.size();
        while (sort && i && this.get(i - 1) > k) i--;
        this.add(k, i);
      },
      'delete': k => this.remove(k)
    });
  }
}