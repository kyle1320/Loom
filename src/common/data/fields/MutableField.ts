import IObject from '../objects/LObject';
import Field from './Field';
import Link, { HeadlessLink } from '../Link';
import EventEmitter from '../../util/EventEmitter';
import FieldObserver from '../../events/FieldObserver';
import ContentObserver from '../../events/ContentObserver';
import { diff } from '../../util';

class MutableFieldObserver extends FieldObserver {
  public destroy: () => void;

  public constructor (
    field: MutableField,
    context: IObject,
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

type RawValue = (string | HeadlessLink)[]
export default class MutableField
  extends EventEmitter<{ update: void }>
  implements Field
{
  private rawValue: RawValue = [];

  public constructor(value: string | RawValue) {
    super();

    this.set(value);
  }

  public set(value: string | RawValue): void {
    if (typeof value === 'string') {
      const re = /\{([^{}|]*)\|([^{}]+)\}/g;
      let index = 0;
      this.rawValue.length = 0;

      let matches = re.exec(value);
      while (matches) {
        if (matches.index > index) {
          this.rawValue.push(value.substring(index, matches.index));
        }

        this.rawValue.push(new HeadlessLink(matches[1], matches[2]));

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

  public raw(context: IObject): (string | Link)[] {
    return this.rawValue
      .map(part => {
        if (typeof part === 'string') return part;
        else return part.resolve(context);
      });
  }

  public get(context: IObject): string {
    return this.raw(context)
      .map(part => {
        if (typeof part === 'string') return part;
        return part.getFieldValue();
      })
      .join('');
  }

  public getAsRawString(): string {
    return this.rawValue.map(String).join('');
  }

  public dependencies(context: IObject): Link[] {
    return this.raw(context)
      .filter((part): part is Link => typeof part !== 'string');
  }

  public observe(context: IObject, recursive: boolean): MutableFieldObserver {
    return new MutableFieldObserver(this, context, recursive);
  }

  public clone(): MutableField {
    return new MutableField(this.rawValue);
  }

  public serialize(): string {
    return this.rawValue.join('');
  }

  public static deserialize(data: string): Field {
    return new MutableField(data);
  }
}