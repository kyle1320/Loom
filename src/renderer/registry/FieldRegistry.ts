export interface FieldInfo {
  key: string;
  friendlyName: string;
  category: string;
  editors: unknown[];
}

export default class FieldRegistry {
  public static readonly global = new FieldRegistry();

  private fields: Map<string, FieldInfo>;

  public constructor() {
    this.fields = new Map();
  }

  public registerField(info: FieldInfo): void {
    this.fields.set(info.key, info);
  }

  public get(key: string): FieldInfo | undefined {
    return this.fields.get(key);
  }
}