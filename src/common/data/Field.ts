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
      data: Field.SerializedData
    ): Field;
  }
}

abstract class Field extends EventEmitter<{ update: void }> {
  protected constructor(
    public readonly key: string
  ) {
    super();
  }

  public abstract get(): string;

  public abstract serialize(): Field.SerializedData;
}

export default Field;