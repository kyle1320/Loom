import Field from '../../data/Field';
import LObject from '../../data/LObject';

export default class BasicField extends Field {
  public constructor(
    private value: string
  ) {
    super();

    this.set(value);
  }

  public set(value: string): void {
    if (value === this.value) return;

    this.value = value;
    this.emit('update');
  }

  public get(context: LObject): string {
    return this.value.replace(/\{([^}]+)\}/g, (_, l) => {
      const [objId, key] = l.split('|');

      try {
        if (objId) {
          return context.project.getFieldValue(objId, key);
        } else {
          return context.getFieldValue(key);
        }
      } catch {
        return _;
      }
    });
  }

  public raw(): string {
    return this.value;
  }

  public dependencies(context: LObject): string[] {
    const re = /\{([^}]+)\}/g;
    const links = [];

    let matches = re.exec(this.value);
    while (matches) {
      if (matches[1].startsWith('|')) {
        matches[1] = `${context.id}${matches[1]}`;
      }

      links.push(matches[1]);

      matches = re.exec(this.value);
    }

    return links;
  }

  public clone(): Field {
    return new BasicField(this.value);
  }

  public serialize(): string {
    return this.value;
  }

  public static deserialize(data: string): Field {
    return new BasicField(data);
  }
}