import LObject from '../objects/LObject';
import DataObject from '../objects/DataObject';
import ClassObject from '../objects/ClassObject';
import ComputedField from '../fields/ComputedField';

class ObjectDB {
  private idCounter = 0;

  private data: Map<string, DataObject> = new Map();
  private classes: Map<string, ClassObject> = new Map();

  public freshId(): string {
    return String(this.idCounter++);
  }

  public makeObject(parent: null | string | LObject = null): DataObject {
    if (typeof parent === 'string') {
      parent = this.getObject(parent) || null;
    }

    const obj = new DataObject(this, parent);

    this.data.set(obj.id, obj);

    return obj;
  }

  public registerClass(
    name: string,
    fields: { [id: string]: ComputedField },
    parent: null | string | ClassObject = null
  ): void {
    if (typeof parent === 'string') {
      parent = this.classes.get(parent) as ClassObject;
    }

    const obj = new ClassObject(this, fields, name, parent);
    this.classes.set(name, obj);
  }

  public *getDataObjectsInDependencyOrder(): IterableIterator<DataObject> {
    const seen = new Set();

    function* visit(obj: LObject): IterableIterator<DataObject> {
      if (seen.has(obj)) return;

      seen.add(obj);

      if (!(obj instanceof DataObject)) return;

      if (obj.parent) yield* visit(obj.parent);

      yield obj;
    }

    for (const obj of this.data.values()) {
      yield* visit(obj);
    }
  }

  public getDataObject(id: string): DataObject | undefined {
    return this.data.get(id);
  }

  public getClassObject(id: string): ClassObject | undefined {
    return this.classes.get(id);
  }

  public getObject(id: string): LObject | undefined {
    return this.getDataObject(id) || this.getClassObject(id);
  }

  public serialize(): ObjectDB.SerializedData {
    return {
      idCounter: this.idCounter,
      objects: [...this.getDataObjectsInDependencyOrder()]
        .map(obj => obj.serialize())
    };
  }

  public static deserialize(
    data: ObjectDB.SerializedData,
    db = new ObjectDB()
  ): ObjectDB {
    db.idCounter = data.idCounter;

    data.objects.forEach(o => {
      const obj = DataObject.deserialize(db, o);
      db.data.set(obj.id, obj);
    });

    return db;
  }
}

namespace ObjectDB {
  export interface SerializedData {
    idCounter: number;
    objects: DataObject.SerializedData[];
  }
}

export default ObjectDB;