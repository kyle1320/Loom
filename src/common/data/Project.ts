import SerializationError from '../errors/SerializationError';
import LObject from './objects/LObject';
import DataExtension from '../extensions/DataExtension';
import DataObject from './objects/DataObject';
import ClassObject from './objects/ClassObject';
import ComputedField from './fields/ComputedField';

class Project {
  private idCounter = 0;
  private objects: Map<string, LObject> = new Map();;
  private extensions: DataExtension[] = [];

  public freshId(): string {
    return String(this.idCounter++);
  }

  public makeObject(parent: null | string | LObject = null): DataObject {
    if (typeof parent === 'string') {
      parent = this.objects.get(parent) || null;
    }

    const obj = new DataObject(this, parent);

    this.objects.set(obj.id, obj);

    return obj;
  }

  public getObject(id: string): LObject | undefined {
    return this.objects.get(id);
  }

  public registerClass(
    name: string,
    fields: { [id: string]: ComputedField },
    parent: null | string | ClassObject = null
  ): void {
    if (typeof parent === 'string') {
      parent = this.objects.get(parent) as ClassObject;
    }

    const obj = new ClassObject(this, fields, parent, name);
    this.objects.set(name, obj);
  }

  public addExtension(ext: DataExtension): void {
    this.extensions.push(ext);
    ext.initProject?.(this);
  }

  public *allObjects(): IterableIterator<LObject> {
    yield* this.objects.values();
  }

  public *DataObjects(): IterableIterator<DataObject> {
    for (const obj of this.allObjects()) {
      if (obj instanceof DataObject) yield obj;
    }
  }

  private *DataObjectsInDependencyOrder(): IterableIterator<LObject> {
    const seen = new Set();

    function* visit(obj: LObject): IterableIterator<LObject> {
      if (seen.has(obj)) return;

      seen.add(obj);

      if (!(obj instanceof DataObject)) return;

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

      idCounter: this.idCounter,
      objects: [...this.DataObjectsInDependencyOrder()]
        .filter((x): x is DataObject => x instanceof DataObject)
        .map(obj => obj.serialize())
    };
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

    proj.idCounter = data.idCounter;

    // TODO: load extenions dynamically from project?
    extensions.forEach(ex => proj.addExtension(ex));

    data.objects.forEach(o => {
      const obj = DataObject.deserialize(proj, o);
      proj.objects.set(obj.id, obj);
    });

    return proj;
  }
}

namespace Project {
  export const serializationVersion = 1;

  export interface SerializedData {
    serializationVersion: number;
    idCounter: number;
    objects: DataObject.SerializedData[];
  }
}

export default Project;