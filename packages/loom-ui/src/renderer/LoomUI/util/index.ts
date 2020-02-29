import { WritableValue, WritableDictionary } from 'loom-data';

export class LookupValue extends WritableValue<string> {
  private readonly unwatch: () => void;

  public constructor(
    private readonly sourceMap: WritableDictionary<string>,
    private readonly key: string
  ) {
    super(sourceMap.get(key) || '');

    this.unwatch = sourceMap.watchKey(key, { change: this.setFromSource });
  }

  public set = (value: string | undefined): boolean => {
    if (super.set(value || '')) {
      if (value) this.sourceMap.set(this.key, value);
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

  public destroy(): void {
    this.unwatch();
    this.allOff();
  }
}