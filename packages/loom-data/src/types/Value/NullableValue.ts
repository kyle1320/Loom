import WritableValue from './WritableValue';

export default class NullableValue<T> extends WritableValue<T | null> {
  public constructor(
    private readonly source: WritableValue<T>,
    private readonly defaultValue: T
  ) {
    super(source.get() || defaultValue);

    this.destroy.do(source.watch(value => void super.set(value)));
  }

  public set = (value: T | null): boolean => {
    if (super.set(value)) {
      this.source.set(value === null ? this.defaultValue : value);
      return true;
    }
    return false;
  }
}