export type FieldInfo = {
  key: string,
  friendlyName: string,
  category: string,
  editors: any[],
}

export default class FieldRegistry {
  public static readonly global = new FieldRegistry();

  private attrs: Map<string, FieldInfo>;

  public constructor() {
    this.attrs = new Map();
  }

  public registerField(info: FieldInfo) {
    this.attrs.set(info.key, info);
  }

  public get(key: string): FieldInfo | undefined {
    return this.attrs.get(key);
  }
}