import EventEmitter from '../util/EventEmitter';
import LObject from './LObject';

abstract class Field extends EventEmitter<{ update: void }> {

  // Field values are represented in a "raw" format that consists of
  // a list of either string values, or references to other fields.
  // These can be used by extensions to affect the way fields are built.
  public abstract raw(context: LObject): Field.Raw;
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

  // dependency links can contain wildcards whereas raw links cannot
  public abstract dependencies(context: LObject): Field.Dependency[];

  public abstract clone(): Field;
  public abstract serialize(): string;
}

namespace Field {
  export interface Deserializer extends Function {
    deserialize(data: string): Field;
  }

  export interface Link {
    objectId: string;
    fieldKey: string;
    default: string;
  }

  export interface Dependency {
    objectId: string;
    path: string;
  }
  export namespace Dependency {
    export const Compare = function (a: Dependency, b: Dependency): number {
      return a.objectId < b.objectId ? -1 : a.objectId > b.objectId ? 1 :
        a.path < b.path ? -1 : a.path > b.path ? 1 : 0;
    };
  }

  export type Raw = (string | Link)[];
}

export default Field;