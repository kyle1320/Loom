import ComputedDictionary from './ComputedDictionary';
import Dictionary from './Dictionary';

export default class MappedDictionary<T, U> extends ComputedDictionary<U> {
  private unwatch: () => void;

  public constructor(
    sourceMap: Dictionary<T>,
    transform: (val: T, key: string, oldValue?: U) => U,
    private readonly cleanup: (val: U) => void
  ) {
    super();

    this.unwatch = sourceMap.watch({
      addRow: (key, value) => this.set(key, transform(value, key, undefined)),
      deleteRow: key => this.cleanup(this.delete(key)!),
      move: (oldKey, newKey) => this.changeKey(oldKey, newKey),
      update: (key, value) => {
        const oldValue = this.data[key];
        this.cleanup(oldValue);
        this.set(key, transform(value, key, oldValue));
      }
    });
  }

  public destroy(): void {
    this.unwatch();
    for (const key in this.data) {
      this.cleanup(this.data[key]);
    }
    this.allOff();
  }
}