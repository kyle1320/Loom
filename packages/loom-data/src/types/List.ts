import { EventEmitter } from './EventEmitter';
import { doAll, Destroyable } from '../util';

export namespace List {
  export type Events<T> = {
    'add': [number, T];
    'remove': [number, T];
  }
}

export class List<T> extends EventEmitter<List.Events<T>> {
  protected readonly data: T[] = [];

  public constructor(
    data: T[] = []
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
    this.data.splice(index, 0, value);
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
    this.data.forEach((value, index) => onAdd(index, value));
    return doAll(
      this.onOff('add', onAdd),
      this.onOff('remove', onRemove)
    );
  }
}

export class WritableList<T> extends List<T> {
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

export abstract class ComputedList<T>
  extends List<T>
  implements Destroyable {

  public abstract destroy(): void;
}

export class MappedList<T, U> extends ComputedList<U> {
  private ignoreEvents = false;

  public constructor(
    private readonly sourceList: WritableList<T>,
    private readonly transform: (val: T, index: number) => U,
    private readonly cleanup?: (val: U) => void
  ) {
    super();

    sourceList.watch(this.sourceAdd, this.sourceRemove);
  }

  public addThrough(src: T, index: number = this.data.length): U {
    const res = this.transform(src, index);

    this.ignoreEvents = true;
    this.sourceList.add(src, index);
    this.add(res, index);
    this.ignoreEvents = false;

    return res;
  }

  private sourceAdd = (index: number, value: T): void => {
    if (this.ignoreEvents) return;
    this.add(this.transform(value, index), index);
  }

  private sourceRemove = (index: number): void => {
    if (this.ignoreEvents) return;
    if (index < this.size()) {
      this.cleanup && this.cleanup(this.data[index]);
    }
    this.removeIndex(index);
  }

  public destroy(): void {
    this.sourceList.off('add', this.sourceAdd);
    this.sourceList.off('remove', this.sourceRemove);
    if (this.cleanup) {
      for (const value of this.data) {
        this.cleanup(value);
      }
    }
    this.allOff();
  }
}