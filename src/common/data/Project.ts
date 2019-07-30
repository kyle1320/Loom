import SerializationError from '../errors/SerializationError';
import LObject from './LObject';
import Field from './Field';
import MissingFieldTypeError from '../errors/MissingFieldTypeError';
import Extension from '../extensions/Extension';
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
    [key: string]: Field.Deserializer;
  } = {};
  private readonly defaultFields: {
    [type: string]: [string, Field][];
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

    const obj = new LObject(this, type, parent);

    const defaultFields = this.defaultFields[type] || [];
    defaultFields.forEach(
      ([key, field]) => obj.addOwnField(key, field.clone())
    );

    this.objects.set(obj.id, obj);

    return obj;
  }

  public getObject(id: string): LObject | undefined {
    return this.objects.get(id);
  }

  public getField(objId: string, key: string): Field | undefined {
    const obj = this.getObject(objId);

    if (!obj) {
      throw new ObjectReferenceError();
    }

    return obj.getField(key);
  }

  public getFieldValue(objId: string, key: string): string {
    const obj = this.getObject(objId);

    if (!obj) {
      throw new ObjectReferenceError();
    }

    return obj.getFieldValue(key);
  }

  public addFieldType(type: Field.Deserializer): void {
    this.fieldTypes[type.name] = type;
  }

  public addDefaultFields(type: string, ...fields: [string, Field][]): void {
    const arr = this.defaultFields[type] || [];
    this.defaultFields[type] = arr.concat(fields);
  }

  public addExtension(ext: Extension): void {
    ext.init(this);
  }

  public *allObjects(): IterableIterator<LObject> {
    yield* this.objects.values();
  }

  private *objectsInDependencyOrder(): IterableIterator<LObject> {
    const seen = new Set();

    function* visit(obj: LObject): IterableIterator<LObject> {
      if (seen.has(obj)) return;

      seen.add(obj);

      if (obj.parent) yield* visit(obj.parent);

      yield obj;
    }

    for (const obj of this.allObjects()) {
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

  public serializeField(field: Field): string {
    return `${field.constructor.name}|${field.serialize()}`;
  }

  public deserializeField(data: string): Field {
    const [type, val] = data.split('|');
    const cls = this.fieldTypes[type];

    if (!cls) {
      throw new MissingFieldTypeError();
    }

    return cls.deserialize(val);
  }

  public static deserialize(data: Project.SerializedData): Project {
    // TODO: handle differing serialization versions
    if (data.serializationVersion !== Project.serializationVersion) {
      throw new SerializationError();
    }

    const proj = new Project();

    data.objects.forEach(o => {
      const obj = LObject.deserialize(proj, o);
      proj.objects.set(obj.id, obj);
    });

    return proj;
  }
}

namespace Project {
  export const serializationVersion = 1;

  export interface SerializedData {
    serializationVersion: number;
    objects: LObject.SerializedData[];
  }
}

export default Project;