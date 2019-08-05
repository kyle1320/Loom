import EventEmitter from '../util/EventEmitter';
import LObject from './LObject';

abstract class Field extends EventEmitter<{ update: void }> {
  public abstract get(context: LObject): string;

  // dependency links can contain wildcards whereas raw links cannot
  public abstract dependencies(context: LObject): Field.Dependency[];

  public abstract clone(): Field;
  public abstract serialize(): string;
}

namespace Field {
  export interface Deserializer extends Function {
    deserialize(data: string): Field;
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
}

export default Field;