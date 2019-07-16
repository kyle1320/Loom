import ObjectStore from "./ObjectStore";
import AttributeStore from "./AttributeStore";
import SerializationError from '../errors/SerializationError';
import LObject from "./LObject";

class Project {
  public readonly objects: ObjectStore;
  public readonly attributes: AttributeStore;

  public constructor() {
    this.objects = new ObjectStore();
    this.attributes = new AttributeStore();
  }

  public makeObject(type: string, parent: null | string | LObject = null) {
    if (typeof parent === 'string') {
      parent = this.objects.fetch(parent) || null;
    }

    return new LObject(this, type, parent);
  }

  public serialize(): Project.SerializedData {
    return {
      serializationVersion: Project.serializationVersion,

      objects: [...this.objects.allInDependencyOrder()]
        .map(obj => obj.serialize())
    };
  }

  public static deserialize(data: Project.SerializedData): Project {
    // TODO: handle differing serialization versions
    if (data.serializationVersion !== Project.serializationVersion) {
      throw new SerializationError();
    }

    var proj = new Project();

    data.objects.forEach(o => LObject.deserialize(proj, o));

    return proj;
  }
}

namespace Project {
  export const serializationVersion = 1;

  export type SerializedData = {
    serializationVersion: number,
    objects: LObject.SerializedData[]
  };
}

export default Project;