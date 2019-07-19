import SerializationError from '../errors/SerializationError';
import LObject from "./LObject";
import Field from "./Field";
import MissingFieldTypeError from '../errors/MissingFieldTypeError';
import Extension from "../extensions/Extension";
import BasicFields from '../extensions/BasicFields';
import ObjectReferenceError from '../errors/ObjectReferenceError';
import Components from '../extensions/Components';

class Project {
  public static readonly defaultExtensions: Extension[] = [
    BasicFields,
    Components
  ];

  private objects: Map<string, LObject>;

  private readonly fieldTypes: {
    [key: string]: Field.Deserializer
  } = {};
  private readonly defaultFields: {
    [type: string]: Field.Factory.ProjectStep[]
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
    var defaultFields = this.defaultFields[type] || [];

    defaultFields.forEach(factory => obj.addOwnField(factory(this)));

    this.objects.set(obj.id, obj);

    return obj;
  }

  public getObject(id: string): LObject | undefined {
    return this.objects.get(id);
  }

  public getField(objId: string, key: string): Field | undefined {
    var obj = this.getObject(objId);

    if (!obj) {
      throw new ObjectReferenceError();
    }

    return obj.getField(key);
  }

  public getFieldValue(objId: string, key: string): string {
    var obj = this.getObject(objId);

    if (!obj) {
      throw new ObjectReferenceError();
    }

    return obj.getFieldValue(key);
  }

  public addFieldType(type: Field.Deserializer) {
    this.fieldTypes[type.name] = type;
  }

  public addDefaultFields(type: string, ...fields: Field.Factory.ProjectStep[]) {
    var arr = this.defaultFields[type] || [];
    this.defaultFields[type] = arr.concat(fields);
  }

  public addExtension(ext: Extension) {
    ext.init(this);
  }

  public *allObjects() {
    yield* this.objects.values();
  }

  private *objectsInDependencyOrder() {
    var seen = new Set();

    function* visit(obj: LObject): IterableIterator<LObject> {
      if (seen.has(obj)) return;

      seen.add(obj);

      if (obj.parent) yield* visit(obj.parent);

      yield obj;
    }

    for (var obj of this.allObjects()) {
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

  public deserializeField(
    data: Field.SerializedData
  ): Field.Factory.ObjectStep {
    var cls = this.fieldTypes[data.type];

    if (!cls) {
      throw new MissingFieldTypeError();
    }

    return cls.deserialize(data)(this);
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