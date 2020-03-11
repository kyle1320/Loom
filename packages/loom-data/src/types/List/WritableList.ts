import List from './List';

export default class WritableList<T> extends List<T> {
  public add(value: T, index: number = this.data.length): void {
    return super.add(value, index);
  }

  public addBefore(value: T, reference: T): boolean {
    return super.addBefore(value, reference);
  }

  public addAfter(value: T, reference: T): boolean {
    return super.addAfter(value, reference);
  }

  public removeIndex(index: number): T {
    return super.removeIndex(index);
  }

  public remove(value: T): boolean {
    return super.remove(value);
  }
}