import LObject from './LObject';
import EventEmitter from '../util/EventEmitter';
import Project from './Project';

namespace Attribute {
  export type SerializedData = {
    type: string,
    key: string,
    value: string
  };

  export interface Deserializer extends Function {
    deserialize(
      project: Project,
      data: Attribute.SerializedData,
      object: LObject
    ): Attribute;
  }
}

interface Attribute extends EventEmitter<{ update: void }> {
  readonly key: string
  readonly id: string;

  get(): string;

  serialize(): Attribute.SerializedData;
}

export default Attribute;