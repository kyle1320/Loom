import LObject from './LObject';
import Field from './Field';
import Link from './Link';
import EventEmitter from '../util/EventEmitter';
import FieldObserver from '../../common/events/FieldObserver';
import ContentObserver from '../../common/events/ContentObserver';
import { diff } from '../util';

class BasicFieldObserver extends FieldObserver {
  public destroy: () => void;

  public constructor (
    field: BasicField,
    context: LObject,
    recursive: boolean
  ) {
    super();

    let dependencies: Link[] = [];
    const observers: Map<string, ContentObserver> = new Map();

    const updateAllDeps = (newLinks: Link[]): void => {
      if (!recursive) return;

      newLinks.sort(Link.compare);

      diff(
        dependencies,
        newLinks,
        (dep: Link, isAdd: boolean) => {
          const key = dep.toString();

          if (isAdd) {
            observers.set(
              key,
              new ContentObserver(dep, true)
                .on('update', this.emit.bind(this, 'update'))
            );
          } else {
            observers.get(key)!.destroy();
            observers.delete(key);
          }
        },
        Link.compare
      );

      dependencies = newLinks;
    };

    const updateListener = (): void => {
      updateAllDeps(field.dependencies(context));
      this.emit('update');
    };

    updateAllDeps(field.dependencies(context));
    field.on('update', updateListener);

    this.destroy = () => {
      updateAllDeps([]);
      field.removeListener('update', updateListener);
    };
  }
}

class BasicField extends EventEmitter<{ update: void }> implements Field {
  private rawValue: BasicField.RawValue = [];

  public constructor(value: string | BasicField.RawValue) {
    super();

    this.set(value);
  }

  public set(value: string | BasicField.RawValue): void {
    if (typeof value === 'string') {
      const re = /\{([^{}|]+)\|([^{}]+)\}/g;
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
    } else {
      this.rawValue = value.slice();
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

  public getAsRawString(context: LObject): string {
    return this.raw(context).map(String).join('');
  }

  public dependencies(context: LObject): Link[] {
    return this.raw(context)
      .filter((part): part is Link => typeof part !== 'string');
  }

  public observe(context: LObject, recursive: boolean): BasicFieldObserver {
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