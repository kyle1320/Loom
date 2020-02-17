import * as loom from 'loom-core';

export class LookupValue extends loom.WritableValue<string> {
  public constructor(
    private readonly sourceMap: loom.WritableStringMap<string>,
    private readonly key: string
  ) {
    super(sourceMap.get(key) || '');

    sourceMap.onKey(key, this.setFromSource);
  }

  public set = (value: string | undefined): boolean => {
    if (super.set(value || '')) {
      if (value) this.sourceMap.set(this.key, value);
      else this.sourceMap.delete(this.key);
      return true;
    }
    return false;
  }

  private setFromSource = (value: string | undefined): boolean => {
    if (super.set(value || '')) {
      this.sourceMap.set(this.key, value || '');
      return true;
    }
    return false;
  }

  public delete(): void {
    this.sourceMap.delete(this.key);
  }

  public destroy(): void {
    this.sourceMap.offKey(this.key, this.set);
    this.allOff();
  }
}