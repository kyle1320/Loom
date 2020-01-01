import Project from '../Project';
import MutableField from '../fields/MutableField';
import LObject, { IllegalFieldKeyError } from './LObject';
import EventEmitter from '../../util/EventEmitter';

namespace DataObject {
  export interface SerializedData {
    id: string;
    parentId: string | null;
    path: string;
    ownFields: { [key: string]: string };
  }
}

const validPathRegex = /^[a-zA-Z0-9/_.-]+$/;
const validFieldNameRegex = /^[a-z][a-z0-9_.-]*$/;

class DataObject extends EventEmitter<{
  fieldAdded: string;
  fieldRemoved: string;
  fieldChanged: string;
  pathChanged: void;
}> implements LObject {
  public readonly fields: LObject.Fields<MutableField>;

  private path: string;

  public constructor(
    public readonly project: Project,
    public readonly parent: LObject | null = null,
    public readonly id: string = project.freshId(),
    path?: string,
  ) {
    super();

    if (!path) path = id;
    if (!validPathRegex.test(path)) throw new IllegalPathError(path);
    this.path = path;

    this.fields = Object.create(parent && parent.fields);

    if (parent && parent instanceof DataObject) {
      for (const evt of [
        'fieldAdded', 'fieldRemoved', 'fieldChanged'
      ] as const) {
        parent.on(evt, key => {
          if (!LObject.hasOwnField(this, key)) {
            this.emit(evt, key);
          }
        });
      }
    }
  }

  public getPath(): string {
    return this.path;
  }

  public setPath(path: string): void {
    if (!validPathRegex.test(path)) throw new IllegalPathError(path);

    this.path = path;
    this.emit('pathChanged');
  }

  public setOwnField(key: string, value: string): void {
    if (LObject.hasOwnField(this, key)) {
      this.fields[key].set(value);
    } else {
      this.addOwnField(key, value);
    }
  }

  public addOwnField(key: string, value: string | MutableField): void {
    key = key.toLowerCase();

    if (!validFieldNameRegex.test(key)) {
      throw new IllegalFieldKeyError();
    }

    const hadField = !!this.fields[key];

    if (typeof value === 'string') {
      value = new MutableField(value);
    }

    this.fields[key] = value;

    if (hadField) {
      this.emit('fieldChanged', key);
    } else {
      this.emit('fieldAdded', key);
    }
  }

  public removeOwnField(key: string): void {
    key = key.toLowerCase();

    const field = this.fields[key];

    if (!field) return;

    delete this.fields[key];

    if (this.fields[key]) {
      this.emit('fieldChanged', key);
    } else {
      this.emit('fieldRemoved', key);
    }
  }

  public serialize(): DataObject.SerializedData {
    const data: DataObject.SerializedData = {
      id: this.id,
      parentId: this.parent && this.parent.id,
      path: this.path,
      ownFields: {}
    };

    for (const key of Object.getOwnPropertyNames(this.fields)) {
      data.ownFields[key] = this.fields[key].serialize();
    }

    return data;
  }

  public static deserialize(
    project: Project,
    data: DataObject.SerializedData
  ): DataObject {
    const obj = new DataObject(
      project,
      data.parentId && project.getObject(data.parentId) || null,
      data.path,
      data.id
    );

    for (const key in data.ownFields) {
      obj.addOwnField(key, data.ownFields[key]);
    }

    return obj;
  }
}

export default DataObject;