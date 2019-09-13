import EventEmitter from '../util/EventEmitter';
import LObject from './LObject';
import Link from './Link';

abstract class Field extends EventEmitter<{ update: void }> {
  public abstract get(context: LObject): string;

  public abstract dependencies(context: LObject): Link[];

  public abstract clone(): Field;
  public abstract serialize(): string;
}

namespace Field {
  export interface Deserializer extends Function {
    deserialize(data: string): Field;
  }
}

export default Field;