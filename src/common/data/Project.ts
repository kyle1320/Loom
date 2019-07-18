import ObjectStore from "./ObjectStore";
import FieldStore from "./FieldStore";
import SerializationError from '../errors/SerializationError';
import LObject from "./LObject";
import Field from "./Field";
import MissingFieldTypeError from '../errors/MissingFieldTypeError';
import Extension from "../extensions/Extension";
import BasicFieldExtension from "../extensions/BasicFields";

class Project {
  public static readonly defaultExtensions: Extension[] = [
    BasicFieldExtension
  ];

  public readonly objects: ObjectStore;
  public readonly fields: FieldStore;

  public readonly extensions: Extension[] = [];

  private readonly fieldTypes: {
    [key: string]: Field.Deserializer
  } = {};
  private readonly objectInitializers: {
    [type: string]: LObject.Initializer[]
  } = {};

  public constructor() {
    this.objects = new ObjectStore();
    this.fields = new FieldStore();

    Project.defaultExtensions.forEach(e => this.addExtension(e));
  }

  public makeObject(
    type: string,
    parent: null | string | LObject = null
  ): LObject {
    if (typeof parent === 'string') {
      parent = this.objects.fetch(parent) || null;
    }

    var obj  = new LObject(this, type, parent);
    var initializers = this.objectInitializers[type] || [];

    initializers.forEach(i => i(obj));

    return obj;
  }

  public addFieldType(type: Field.Deserializer) {
    this.fieldTypes[type.name] = type;
  }

  public addObjectInitializer(type: string, init: LObject.Initializer) {
    if (type in this.objectInitializers) {
      this.objectInitializers[type].push(init);
    } else {
      this.objectInitializers[type] = [init];
    }
  }

  public addExtension(ext: Extension) {
    ext.init(this);
  }

  public serialize(): Project.SerializedData {
    return {
      serializationVersion: Project.serializationVersion,

      objects: [...this.objects.allInDependencyOrder()]
        .map(obj => obj.serialize())
    };
  }

  public deserializeField(
    data: Field.SerializedData,
    object: LObject
  ): Field {
    var cls = this.fieldTypes[data.type];

    if (!cls) {
      throw new MissingFieldTypeError();
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