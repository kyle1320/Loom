import LObject from './LObject';
import Link from './Link';
import FieldObserver from '../events/FieldObserver';

interface Field {
  get(context: LObject): string;
  dependencies(context: LObject): Link[];
  observe(context: LObject, recursive: boolean): FieldObserver;

  clone(): Field;
  serialize(): string;
}

namespace Field {
  export interface Deserializer<T extends Field = Field> extends Function {
    deserialize(data: string): T;
  }
}

export default Field;