import Dictionary from './Dictionary';

export default class MappedDictionary<T, U> extends Dictionary<U> {
  public constructor(
    sourceMap: Dictionary<T>,
    transform: (val: T, key: string, oldValue?: U) => U,
    private readonly cleanup: (val: U) => void
  ) {
    super();

    this.destroy.do(sourceMap.watch({
      addRow: (key, value) => this.set(key, transform(value, key, undefined)),
      deleteRow: key => this.cleanup(this.delete(key)!),
      move: (oldKey, newKey) => this.changeKey(oldKey, newKey),
      update: (key, value) => {
        const oldValue = this.data[key];
        this.cleanup(oldValue);
        this.set(key, transform(value, key, oldValue));
      }
    }), () => {
      for (const key in this.data) {
        this.cleanup(this.data[key]);
      }
    });
  }
}