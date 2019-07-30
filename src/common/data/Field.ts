import EventEmitter from '../util/EventEmitter';
import LObject from './LObject';

namespace Field {
  export interface Deserializer extends Function {
    deserialize(data: string): Field;
  }
}

abstract class Field extends EventEmitter<{ update: void }> {
  public abstract get(context: LObject): string;

  // dependencies are in the format [object id]|[field path]
  // where paths can contain wildcards.
  public abstract dependencies(context: LObject): string[];

  public abstract clone(): Field;
  public abstract serialize(): string;
}

export default Field;