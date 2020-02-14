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

  public add(value: T, index: number = this.data.length): void {
    this.data.splice(index, 0, value);
    this.emit('add', { index, value });
  }

  public addBefore(value: T, reference: T): boolean {
    const index = this.data.indexOf(reference);
    if (index > -1) {
      this.add(value, index);
      return true;
    }
    return false;
  }

  public addAfter(value: T, reference: T): boolean {
    const index = this.data.indexOf(reference);
    if (index > -1) {
      this.add(value, index + 1);
      return true;
    }
    return false;
  }

  public removeIndex(index: number): T {
    const value = this.data.splice(index, 1)[0];
    this.emit('remove', { index, value });
    return value;
  }

  public remove(value: T): boolean {
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
}