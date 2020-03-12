import Value from './Value';

export default class MappedValue<T, U> extends Value<U> {
  public constructor(
    source: Value<T>,
    transform: (value: T) => U,
    cleanup: (value: U) => void
  ) {
    super(transform(source.get()));

    this.destroy.do(
      source.onOff('change', (value: T): void => {
        const oldValue = this.get();
        if (this.set(transform(value))) {
          cleanup(oldValue);
        }
      }),
      () => cleanup(this.get())
    );
  }
}