import Field from '../../data/Field';
import LObject from '../../data/LObject';

class BasicField extends Field {
  public readonly rawValue: BasicField.RawValue = [];

  public constructor(
    value: string | BasicField.RawValue
  ) {
    super();

    if (typeof value === 'string') {
      this.setFromString(value);
    } else {
      this.rawValue = value;
    }
  }

  public setFromString(value: string): void {
    const re = /\{([^}]+)\}/g;
    let index = 0;
    this.rawValue.length = 0;

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

  public raw(context: LObject): BasicField.RawValue {
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

  public get(context: LObject): string {
    return this.raw(context)
      .map(part => {
        if (typeof part === 'string') return part;
        return context.project.getFieldValueOrDefault(
          part.objectId, part.fieldKey, part.default
        );
      })
      .join('');
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
    return new BasicField(this.rawValue);
  }

  public serialize(): string {
    return this.rawValue.map(part => {
      if (typeof part === 'string') return part;
      return `{${part.objectId}|${part.fieldKey}}`;
    }).join('');
  }

  public static deserialize(data: string): Field {
    return new BasicField(data);
  }
}

namespace BasicField {
  export interface Link {
    objectId: string;
    fieldKey: string;
    default: string;
  }

  export type RawValue = (string | Link)[];
}

export default BasicField;