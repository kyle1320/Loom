import EventEmitter from '../util/EventEmitter';
import Project from './Project';
import LObject from './LObject';

namespace Field {
  export type Factory = (project: Project) => Field.Factory.WithProject;
  export namespace Factory {
    export type WithProject = (object: LObject) => Field;
  }

  export interface SerializedData {
    type: string;
    key: string;
    value: string;
  }

  export interface Deserializer extends Function {
    deserialize(data: Field.SerializedData): Field.Factory;
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