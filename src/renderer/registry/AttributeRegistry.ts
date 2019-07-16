export type AttributeInfo = {
  key: string,
  friendlyName: string,
  category: string,
  editors: any[],
}

export default class AttributeRegistry {
  public static readonly global = new AttributeRegistry();

  private attrs: Map<string, AttributeInfo>;

  public constructor() {
    this.attrs = new Map();
  }

  public registerAttribute(info: AttributeInfo) {
    this.attrs.set(info.key, info);
  }

  public get(key: string): AttributeInfo | undefined {
    return this.attrs.get(key);
  }
}