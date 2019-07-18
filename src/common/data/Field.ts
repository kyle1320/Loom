import LObject from './LObject';
import EventEmitter from '../util/EventEmitter';
import Project from './Project';

namespace Field {
  export type SerializedData = {
    type: string,
    key: string,
    value: string
  };

  export interface Deserializer extends Function {
    deserialize(
      project: Project,
      data: Field.SerializedData,
      object: LObject
    ): Field;
  }
}

interface Field extends EventEmitter<{ update: void }> {
  readonly key: string
  readonly id: string;

  get(): string;

  serialize(): Field.SerializedData;
}

export default Field;