import { EventEmitter } from '../util/EventEmitter';
import { Destroyable } from '../util';

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

  public map<U>(
    transform: (val: T) => U,
    cleanup?: (val: U) => void
  ): ComputedList<U> {
    return new MappedList(this, transform, cleanup);
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

export abstract class ComputedList<T> extends List<T> implements Destroyable {
  public abstract destroy(): void;
}

class MappedList<T, U> extends ComputedList<U> {
  public constructor(
    private readonly source: List<T>,
    private readonly transform: (val: T) => U,
    private readonly cleanup?: (val: U) => void
  ) {
    super(source.asArray().map(transform));

    source.on('add', this.sourceAdd);
    source.on('remove', this.sourceRemove);
  }

  private sourceAdd = (
    { index, value }: { index: number; value: T }
  ): void => {
    this.add(this.transform(value), index);
  }

  private sourceRemove = ({ index }: { index: number }): void => {
    this.cleanup && this.cleanup(this.get(index));
    this.remove(index);
  }

  public destroy(): void {
    this.source.off('add', this.sourceAdd);
    this.source.off('remove', this.sourceRemove);
    this.cleanup && this.data.forEach(d => this.cleanup!(d));
    this.allOff();
  }
}