import EventEmitter from '../util/EventEmitter';
import Project from './Project';
import LObject from './LObject';

namespace Field {
  export namespace Factory {
    export type ProjectStep = (project: Project) => Field.Factory.ObjectStep;
    export type ObjectStep = (object: LObject) => Field;
  }

  export type SerializedData = {
    type: string,
    key: string,
    value: string
  };

  export interface Deserializer extends Function {
    deserialize(data: Field.SerializedData): Field.Factory.ProjectStep;
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