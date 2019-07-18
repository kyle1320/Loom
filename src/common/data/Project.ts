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

  private objects: Map<string, LObject>;

  private readonly fieldTypes: {
    [key: string]: Field.Deserializer
  } = {};
  private readonly objectInitializers: {
    [type: string]: LObject.Initializer[]
  } = {};

  public constructor() {
    this.objects = new Map();

    Project.defaultExtensions.forEach(e => this.addExtension(e));
  }

  public makeObject(
    type: string,
    parent: null | string | LObject = null
  ): LObject {
    if (typeof parent === 'string') {
      parent = this.objects.get(parent) || null;
    }

    var obj = new LObject(type, parent);
    var initializers = this.objectInitializers[type] || [];

    initializers.forEach(i => i(obj));

    this.objects.set(obj.id, obj);

    return obj;
  }

  public getObject(id: string): LObject | undefined {
    return this.objects.get(id);
  }

  public getField(objId: string, key: string): Field | undefined {
    var obj = this.objects.get(objId);
    return obj && obj.getField(key)
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

  private *objectsInDependencyOrder() {
    var seen = new Set();

    function* visit(obj: LObject): IterableIterator<LObject> {
      if (seen.has(obj)) return;

      seen.add(obj);

      if (obj.parent) yield* visit(obj.parent);

      yield obj;
    }

    for (var obj of this.objects.values()) {
      yield* visit(obj);
    }
  }

  public serialize(): Project.SerializedData {
    return {
      serializationVersion: Project.serializationVersion,

      objects: [...this.objectsInDependencyOrder()]
        .map(obj => obj.serialize())
    };
  }

  public deserializeField(data: Field.SerializedData): Field {
    var cls = this.fieldTypes[data.type];

    if (!cls) {
      throw new MissingFieldTypeError();
    }

    return cls.deserialize(this, data);
  }

  public static deserialize(data: Project.SerializedData): Project {
    // TODO: handle differing serialization versions
    if (data.serializationVersion !== Project.serializationVersion) {
      throw new SerializationError();
    }

    var proj = new Project();

    data.objects.forEach(o => {
      var obj = LObject.deserialize(proj, o);
      proj.objects.set(obj.id, obj);
    });

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