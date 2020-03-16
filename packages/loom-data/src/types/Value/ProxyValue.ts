import WritableValue from './WritableValue';

export default class ProxyValue<T> extends WritableValue<T> {
  public source: WritableValue<WritableValue<T> | null>;

  public constructor(
    private defaultValue: T,
    source: WritableValue<T> | null = null,
  ) {
    super(defaultValue);

    this.source = new WritableValue(source);

    this.destroy.do(this.source.watch(src => src
      ? src.watch(this.update)
      : this.update(defaultValue, undefined)
    ));
  }

  public set(value: T): boolean {
    const src = this.source.get();
    if (src) return src.set(value);
    return false;
  }

  public get(): T {
    const src = this.source.get();
    if (!src) return this.defaultValue;
    return src.get();
  }

  private update = (value: T, oldValue: T | undefined): void => {
    this.emit('change', value, oldValue || this.defaultValue);
  }
}