import Field from '../../data/Field';
import LObject from '../../data/LObject';

export default class BasicField extends Field {
  private rawValue: Field.Raw = [];

  public constructor(
    private value: string
  ) {
    super();

    this.set(value);
  }

  public set(value: string): void {
    this.value = value;

    const re = /\{([^}]+)\}/g;
    let index = 0;
    this.rawValue = [];

    let matches = re.exec(value);
    while (matches) {
      if (matches.index > index) {
        this.rawValue.push(value.substring(index, matches.index));
      }

      const [objectId, fieldKey] = matches[1].split('|');
      this.rawValue.push({ objectId, fieldKey, default: matches[0] });

      index = matches.index + matches[0].length;
      matches = re.exec(value);
    }

    if (value.length > index) {
      this.rawValue.push(value.substring(index, value.length));
    }

    this.emit('update');
  }

  public raw(context: LObject): Field.Raw {
    return this.rawValue.map(part => {
      if (typeof part === 'string') return part;
      if (part.objectId) return part;
      return {
        objectId: context.id,
        fieldKey: part.fieldKey,
        default: part.default
      };
    });
  }

  public dependencies(context: LObject): Field.Dependency[] {
    const deps = [];
    for (const part of this.raw(context)) {
      if (typeof part !== 'string') {
        deps.push({
          objectId: part.objectId,
          path: part.fieldKey
        });
      }
    }
    return deps;
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