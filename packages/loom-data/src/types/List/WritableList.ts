import List from './List';

class WritableList<T> extends List<T> {}
interface WritableList<T> {
  add(value: T, index?: number): void;
  addBefore(value: T, reference: T): boolean;
  addAfter(value: T, reference: T): boolean;
  removeIndex(index: number): T;
  remove(value: T): boolean;
}

export default WritableList;