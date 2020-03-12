import { WritableValue, WritableDictionary } from 'loom-data';

export class LookupValue extends WritableValue<string> {
  public constructor(
    private readonly sourceMap: WritableDictionary<string>,
    private readonly key: string,
    private readonly defaultValue?: string
  ) {
    super(sourceMap.get(key) || defaultValue || '');

    this.destroy.do(sourceMap.watchKey(key, { change: this.setFromSource }));
  }

  public set = (value: string | undefined): boolean => {
    value = value || this.defaultValue;
    if (super.set(value || '')) {
      if (typeof value !== 'undefined') this.sourceMap.set(this.key, value);
      else this.sourceMap.delete(this.key);
      return true;
    }
    return false;
  }

  private setFromSource = (value: string | undefined): void => {
    super.set(value || '');
  }

  public delete(): void {
    this.sourceMap.delete(this.key);
  }
}

export class NullableValue<T> extends WritableValue<T | null> {
  public constructor(
    private readonly source: WritableValue<T>,
    private readonly defaultValue: T
  ) {
    super(source.get() || defaultValue);

    this.destroy.do(source.watch(this.setFromSource));
  }

  public set = (value: T | null): boolean => {
    value = value || this.defaultValue;
    if (super.set(value)) {
      this.source.set(value);
      return true;
    }
    return false;
  }

  private setFromSource = (value: T | undefined): void => {
    super.set(value || this.defaultValue);
  }
}