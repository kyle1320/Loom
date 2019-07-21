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
      const split = l.split('|');
      return context.project.getFieldValue(split[0], split[1]);
    });
  }

  public raw(): string {
    return this.value;
  }

  public dependencies(): string[] {
    const re = /\{([^}]+)\}/g;
    const links = [];

    let matches = re.exec(this.value);
    while (matches) {
      links.push(matches[1]);

      matches = re.exec(this.value);
    }

    return links;
  }

  public clone(): Field {
    return new BasicField(this.value);
  }

  public serialize(): Field.SerializedData {
    return {
      type: BasicField.name,
      value: this.value
    };
  }

  public static deserialize(
    data: Field.SerializedData
  ): Field {
    return new BasicField(data.value);
  }
}