import Dictionary from './Dictionary';
import { List } from '../List';

export default class DictionaryKeys<T> extends List<string> {
  public constructor(source: Dictionary<T>, sort = false) {
    super([]);

    this.destroy.do(source.watch({
      add: k => {
        let i = this.size();
        while (sort && i && this.get(i - 1) > k) i--;
        this.add(k, i);
      },
      delete: k => this.remove(k)
    }));
  }
}