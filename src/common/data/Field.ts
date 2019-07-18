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

abstract class Field extends EventEmitter<{ update: void }> {
  public readonly id: string

  protected constructor(
    object: LObject,
    public readonly key: string
  ) {
    super();

    this.id = `${object.id}|${key}`;
  }

  public abstract get(): string;

  public abstract serialize(): Field.SerializedData;
}

export default Field;