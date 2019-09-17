import SerializationError from '../errors/SerializationError';
import LObject from './LObject';
import Field from './Field';
import MissingFieldTypeError from '../errors/MissingFieldTypeError';
import DataExtension from '../extensions/DataExtension';

class Project {
  private objects: Map<string, LObject>;
  private extensions: DataExtension[] = [];

  private readonly fieldTypes: {
    [key: string]: Field.Deserializer;
  } = {};
  private readonly defaultFields: {
    [type: string]: [string, Field][];
  } = {};

  public constructor() {
    this.objects = new Map();
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

  public addFieldType(type: Field.Deserializer): void {
    this.fieldTypes[type.name] = type;
  }

  public addDefaultFields(type: string, ...fields: [string, Field][]): void {
    const arr = this.defaultFields[type] || [];
    this.defaultFields[type] = arr.concat(fields);
  }

  public addExtension(ext: DataExtension): void {
    this.extensions.push(ext);
    ext.initProject(this);
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

  public static deserialize(
    data: Project.SerializedData,
    extensions: DataExtension[]
  ): Project {
    // TODO: handle differing serialization versions
    if (data.serializationVersion !== Project.serializationVersion) {
      throw new SerializationError();
    }

    const proj = new Project();

    // TODO: load extenions dynamically from project?
    extensions.forEach(ex => proj.addExtension(ex));

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