import LObject from '../objects/LObject';
import DataObject from '../objects/DataObject';
import ClassObject from '../objects/ClassObject';
import ComputedField from '../fields/ComputedField';
import DBNode from './DBNode';

export class ItemAlreadyExistsError extends Error {}

function insert(parent: DBNode, node: DBNode, path: string): void {
  const parts = path.split('/');
  const name = parts[parts.length - 1];

  if (node.parent) {
    delete node.parent.children[node.name];
  }

  try {
    for (let i = 0; i < parts.length - 1; i++) {
      const dir = parts[i];
      let next = parent.children[dir];

      if (!next) {
        next = parent.children[dir] = new DBNode(parent, dir);
        parent.notify();
      }

      parent = next;
    }

    if (parent.children[name]) throw new ItemAlreadyExistsError();

  // if an exception occurs, undo changes
  } catch (e) {
    if (node.parent) {
      node.parent.children[node.name] = node;
    }

    throw e;
  }

  if (node.parent) {
    node.parent.notify();
  }

  parent.children[name] = node;
  node.name = name;
  node.parent = parent;
  parent.notify();
}

// TODO: add ability to listen for changes on a path, or to an object
class ObjectDB {
  private idCounter = 0;

  // DataObjects have a path, stored in a tree
  private root: DBNode = new DBNode(undefined, '');
  private data: Map<string, DBNode> = new Map();

  // ClassObjects have no path
  private classes: Map<string, ClassObject> = new Map();

  // //////////// //
  //   CREATION   //
  // //////////// //

  private freshId(): string {
    return String(this.idCounter++);
  }

  public makeObject(path: string, parent: null | string | LObject): DataObject {
    if (typeof parent === 'string') {
      parent = this.getObject(parent) || null;
    }

    const obj = new DataObject(this, this.freshId(), parent);

    this.place(path, obj);

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

  // ///////////// //
  //   RETRIEVAL   //
  // ///////////// //

  public getDataObject(id: string): DataObject | undefined {
    return this.data.get(id)?.item;
  }

  public getClassObject(id: string): ClassObject | undefined {
    return this.classes.get(id);
  }

  public getObject(id: string): LObject | undefined {
    return this.getDataObject(id) || this.getClassObject(id);
  }

  public getObjectAtPath(path: string): DataObject | undefined {
    return this.getNodeAtPath(path)?.item;
  }

  public getNodeAtPath(path: string): DBNode | undefined {
    let node = this.root;
    for (const name of path.split('/')) {
      if (!name) continue;

      const next = node.children[name];
      if (!next) return next;
      else node = next;
    }
    return node;
  }

  public *getDataObjects(): IterableIterator<DataObject> {
    for (const node of this.data.values()) {
      if (node.item) yield node.item;
    }
  }

  // TODO: uncomment if needed. Not super efficient.
  // public getPathFromId(id: string): string | undefined {
  //   return this.data.get(id)?.getPath();
  // }

  // //////////// //
  //   UPDATING   //
  // //////////// //

  public place(path: string, item: DataObject): void {
    let node = this.data.get(item.id);

    if (!node) {
      node = new DBNode(undefined, '', item);
      this.data.set(item.id, node);
    }

    insert(this.root, node, path);
  }

  // ///////////////// //
  //   SERIALIZATION   //
  // ///////////////// //

  public serialize(): ObjectDB.SerializedData {
    return {
      idCounter: this.idCounter,
      root: this.root.serialize()
    };
  }

  public static deserialize(
    data: ObjectDB.SerializedData,
    db = new ObjectDB()
  ): ObjectDB {
    db.idCounter = data.idCounter;

    const objects = db.deserializeNode(data.root, db.root);

    // we must be careful to deserialize objects in proper order
    // so that parent objects are created before their children
    for (const id in objects) {
      db.deserializeObject(id, objects);
    }

    return db;
  }

  private deserializeNode(
    data: DBNode.SerializedData,
    node: DBNode,
    res: { [S in string]?: DataObject.SerializedData } = {}
  ): typeof res {
    if (data.item) {
      res[data.item.id] = data.item;
      this.data.set(data.item.id, node);
    }
    for (const key in data.children) {
      this.deserializeNode(
        data.children[key]!,
        node.children[key] = new DBNode(node, key),
        res
      );
    }
    return res;
  }

  private deserializeObject(
    id: string,
    objects: { [S in string]?: DataObject.SerializedData }
  ): void {
    const node = this.data.get(id)!
    if (node.item) return;

    const data = objects[id]!;
    if (data.parentId) this.deserializeObject(data.parentId, objects);

    node.item = DataObject.deserialize(this, data);
  }
}

namespace ObjectDB {
  export interface SerializedData {
    idCounter: number;
    root: DBNode.SerializedData;
  }
}

export default ObjectDB;