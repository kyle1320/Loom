import LObject from './LObject';
import Link from './Link';
import FieldObserver from '../events/FieldObserver';

interface Field {
  get(context: LObject): string;

  dependencies(context: LObject): Link[];

  observe(
    context: LObject,
    recursive: boolean
  ): FieldObserver;

  clone(): Field;
  serialize(): string;
}

namespace Field {
  export interface Deserializer extends Function {
    deserialize(data: string): Field;
  }
}

export default Field;