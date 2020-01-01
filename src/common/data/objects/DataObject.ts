import ObjectDB from '../db/ObjectDB';
import MutableField from '../fields/MutableField';
import LObject, { IllegalFieldKeyError } from './LObject';
import EventEmitter from '../../util/EventEmitter';

namespace DataObject {
  export interface SerializedData {
    id: string;
    parentId: string | null;
    ownFields: { [key: string]: string };
  }
}

const validFieldNameRegex = /^[a-z][a-z0-9_.-]*$/;

class DataObject extends EventEmitter<{
  fieldAdded: string;
  fieldRemoved: string;
  fieldChanged: string;
}> implements LObject {
  public readonly fields: LObject.Fields<MutableField>;

  public constructor(
    public readonly db: ObjectDB,
    public readonly id: string,
    public readonly parent: LObject | null = null
  ) {
    super();

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

  public setOwnField(key: string, value: string): void {
    if (LObject.hasOwnField(this, key)) {
      this.fields[key]!.set(value);
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
      ownFields: {}
    };

    for (const key of Object.getOwnPropertyNames(this.fields)) {
      data.ownFields[key] = this.fields[key]!.serialize();
    }

    return data;
  }

  public static deserialize(
    db: ObjectDB,
    data: DataObject.SerializedData
  ): DataObject {
    const obj = new DataObject(
      db,
      data.id,
      data.parentId && db.getObject(data.parentId) || null
    );

    for (const key in data.ownFields) {
      obj.addOwnField(key, data.ownFields[key]);
    }

    return obj;
  }
}

export default DataObject;