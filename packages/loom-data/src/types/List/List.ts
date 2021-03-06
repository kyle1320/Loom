import { EventEmitter } from '../EventEmitter';
import { doAll } from '../../util';

namespace List {
  export type Events<T> = {
    'add': [number, T];
    'remove': [number, T];
  }
}

class List<T> extends EventEmitter<List.Events<T>> {
  protected data: T[] = [];

  public constructor(
    data: Readonly<T[]> = []
  ) {
    super();

    data.forEach(x => this.add(x));
  }

  public get(index: number): T {
    return this.data[index];
  }

  public size(): number {
    return this.data.length;
  }

  protected add(value: T, index: number = this.data.length): void {
    if (index === this.data.length) this.data.push(value);
    else this.data = [
      ...this.data.slice(0, index),
      value,
      ...this.data.slice(index)
    ];
    this.emit('add', index, value);
  }

  protected addBefore(value: T, reference: T): boolean {
    const index = this.data.indexOf(reference);
    if (index > -1) {
      this.add(value, index);
      return true;
    }
    return false;
  }

  protected addAfter(value: T, reference: T): boolean {
    const index = this.data.indexOf(reference);
    if (index > -1) {
      this.add(value, index + 1);
      return true;
    }
    return false;
  }

  protected removeIndex(index: number): T {
    const value = this.data.splice(index, 1)[0];
    this.emit('remove', index, value);
    return value;
  }

  protected remove(value: T): boolean {
    const index = this.data.indexOf(value);
    if (index > -1) {
      this.removeIndex(index);
      return true;
    }
    return false;
  }

  public [Symbol.iterator](): IterableIterator<T> {
    return this.data[Symbol.iterator]();
  }

  public asArray(): Readonly<T[]> {
    return this.data;
  }

  public watch(
    onAdd: (index: number, value: T) => void,
    onRemove: (index: number, value: T) => void
  ): () => void {
    const cleanup = doAll(
      this.onOff('add', onAdd),
      this.onOff('remove', onRemove)
    );
    this.data.forEach((value, index) => onAdd(index, value));
    return cleanup;
  }
}

export default List;