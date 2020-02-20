import { WritableValue, WritableStringMap } from 'loom-data';

export class LookupValue extends WritableValue<string> {
  public constructor(
    private readonly sourceMap: WritableStringMap<string>,
    private readonly key: string
  ) {
    super(sourceMap.get(key) || '');

    sourceMap.valueChanges.on(key, this.setFromSource);
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
    this.sourceMap.valueChanges.off(this.key, this.setFromSource);
    this.allOff();
  }
}