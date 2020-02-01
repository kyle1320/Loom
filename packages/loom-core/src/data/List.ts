import { EventEmitter } from '../util/EventEmitter';

export namespace List {
  export type Events<T> = {
    'add': { index: number; value: T };
    'remove': { index: number; value: T };
  }
}

export class List<T> extends EventEmitter<List.Events<T>> {
  public constructor(
    protected readonly data: T[] = []
  ) {
    super();
  }

  public get(index: number): T {
    return this.data[index];
  }

  public size(): number {
    return this.data.length;
  }

  protected add(value: T, index: number = this.data.length): void {
    this.data.splice(index, 0, value);
    this.emit('add', { index, value });
  }

  protected remove(index: number): T {
    const value = this.data.splice(index, 1)[0];
    this.emit('remove', { index, value });
    return value;
  }

  public [Symbol.iterator](): IterableIterator<T> {
    return this.data[Symbol.iterator]();
  }

  public asArray(): Readonly<T[]> {
    return this.data;
  }
}

export class WritableList<T> extends List<T> {
  public add(value: T, index?: number): void {
    super.add(value, index);
  }

  public remove(index: number): T {
    return super.remove(index);
  }
}