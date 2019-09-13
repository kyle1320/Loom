import Field from '../../data/Field';
import LObject from '../../data/LObject';
import Link from '../../data/Link';
import EventEmitter from '../../util/EventEmitter';
import BasicFieldObserver from './BasicFieldObserver';

class BasicField extends EventEmitter<{ update: void }> implements Field {
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
    const re = /\{([^}|]+)\|([^}]+)\}/g;
    let index = 0;
    this.rawValue.length = 0;

    let matches = re.exec(value);
    while (matches) {
      if (matches.index > index) {
        this.rawValue.push(value.substring(index, matches.index));
      }

      // TODO: support empty object id
      this.rawValue.push(new Link(null!, matches[1], matches[2]));

      index = matches.index + matches[0].length;
      matches = re.exec(value);
    }

    if (value.length > index) {
      this.rawValue.push(value.substring(index, value.length));
    }

    this.emit('update');
  }

  public raw(context: LObject): BasicField.RawValue {
    return this.rawValue
      .map(part => {
        if (typeof part === 'string') return part;
        return part.withProject(context.project);
      });
  }

  public get(context: LObject): string {
    return this.raw(context)
      .map(part => {
        if (typeof part === 'string') return part;
        return part.getFieldValue();
      })
      .join('');
  }

  public dependencies(context: LObject): Link[] {
    return this.raw(context)
      .filter((part): part is Link => typeof part !== 'string');
  }

  public observe(
    context: LObject,
    recursive: boolean
  ): BasicFieldObserver {
    return new BasicFieldObserver(this, context, recursive);
  }

  public clone(): Field {
    return new BasicField(this.rawValue);
  }

  public serialize(): string {
    return this.rawValue.join('');
  }

  public static deserialize(data: string): Field {
    return new BasicField(data);
  }
}

namespace BasicField {
  export type RawValue = (string | Link)[];
}

export default BasicField;