import ComputedList from './ComputedList';
import WritableList from './WritableList';

export default class MappedList<T, U> extends ComputedList<U> {
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