import Value from './Value';
import ComputedValue from './ComputedValue';

export default class MappedValue<T, U> extends ComputedValue<U> {
  public constructor(
    private readonly source: Value<T>,
    private readonly transform: (value: T) => U,
    private readonly cleanup: (value: U) => void
  ) {
    super(transform(source.get()));

    source.on('change', this.update);
  }

  private update = (value: T): void => {
    const oldValue = this.get();
    if (this.set(this.transform(value))) {
      this.cleanup(oldValue);
    }
  }

  public destroy(): void {
    this.cleanup(this.get());
    this.source.off('change', this.update);
    this.allOff();
  }
}