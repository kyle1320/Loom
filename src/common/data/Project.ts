import ObjectStore from "./ObjectStore";
import AttributeStore from "./AttributeStore";
import SerializationError from '../errors/SerializationError';
import LObject from "./LObject";
import Attribute from "./Attribute";
import MissingAttributeTypeError from '../errors/MissingAttributeTypeError';
import Extension from "../extensions/Extension";
import BasicAttributeExtension from "../extensions/BasicAttributes";

class Project {
  public readonly objects: ObjectStore;
  public readonly attributes: AttributeStore;

  private readonly attributeTypes: {
    [key: string]: Attribute.Deserializer
  };

  public constructor() {
    this.objects = new ObjectStore();
    this.attributes = new AttributeStore();

    this.attributeTypes = {};

    // TODO: move this?
    this.addExtensions(new BasicAttributeExtension());
  }

  public makeObject(type: string, parent: null | string | LObject = null) {
    if (typeof parent === 'string') {
      parent = this.objects.fetch(parent) || null;
    }

    return new LObject(this, type, parent);
  }

  public addAttributeType(type: Attribute.Deserializer) {
    this.attributeTypes[type.name] = type;
  }

  public addExtensions(...extensions: Extension[]) {
    extensions.forEach(e => e.init(this));
  }

  public serialize(): Project.SerializedData {
    return {
      serializationVersion: Project.serializationVersion,

      objects: [...this.objects.allInDependencyOrder()]
        .map(obj => obj.serialize())
    };
  }

  public deserializeAttribute(
    data: Attribute.SerializedData,
    object: LObject
  ): Attribute {
    var cls = this.attributeTypes[data.type];

    if (!cls) {
      throw new MissingAttributeTypeError();
    }

    return cls.deserialize(this, data, object);
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