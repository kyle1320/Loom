import Field from './Field';
import Project from './Project';
import FieldReferenceError from '../errors/FieldReferenceError';
import IllegalFieldKeyError from '../errors/IllegalFieldKeyError';
import IllegalPathError from '../errors/IllegalPathError';
import EventEmitter from '../util/EventEmitter';
import Link from './Link';

namespace LObject {
  export interface SerializedData {
    type: string;
    id: string;
    parentId: string | null;
    path: string;
    ownFields: { [key: string]: string };
  }
}

let counter = 0;

const validFieldNameRegex = /^[a-z0-9_.-]+$/;
const validPathRegex = /^[a-zA-Z0-9/_.-]+$/;

class LObject extends EventEmitter<{
  fieldAdded: string;
  fieldRemoved: string;
  fieldChanged: string;
  pathChanged: void;
}> {
  private fields: { [id: string]: Field };

  private path: string;

  public constructor(
    public readonly project: Project,
    public readonly type: string,
    public readonly parent: LObject | null = null,
    path?: string,
    public readonly id = String(counter++)
  ) {
    super();

    if (!path) path = id;
    if (!validPathRegex.test(path)) throw new IllegalPathError(path);

    this.path = path;

    this.fields = Object.create(parent && parent.fields);

    if (parent) {
      for (const evt of [
        'fieldAdded', 'fieldRemoved', 'fieldChanged'
      ] as const) {
        parent.on(evt, key => {
          if (!this.hasOwnField(key)) {
            this.emit(evt, key);
          }
        });
      }
    }
  }

  public *getOwnFieldNames(path: string = '*'): IterableIterator<string> {
    path = path.toLowerCase();

    if (path == '*') {
      yield* Object.getOwnPropertyNames(this.fields);
    } else if (path.endsWith('*')) {
      path = path.substring(0, path.length - 1);
      for (const key of Object.getOwnPropertyNames(this.fields)) {
        if (key.startsWith(path)) yield key;
      }
    } else if (Object.prototype.hasOwnProperty.call(this.fields, path)) {
      yield path;
    }
  }

  public *getFieldNames(path: string = '*'): IterableIterator<string> {
    path = path.toLowerCase();

    if (path == '*') {
      for (const key in this.fields) {
        yield key;
      }
    } else if (path.endsWith('*')) {
      path = path.substring(0, path.length - 1);
      for (const key in this.fields) {
        if (key.startsWith(path)) yield key;
      }
    } else if (path in this.fields) {
      yield path;
    }
  }

  public *getOwnFields(path: string = '*'): IterableIterator<Field> {
    for (const key of this.getOwnFieldNames(path)) {
      yield this.getField(key)!;
    }
  }

  public *getFields(path: string = '*'): IterableIterator<Field> {
    for (const key of this.getFieldNames(path)) {
      yield this.getField(key)!;
    }
  }

  public getField(key: string): Field | undefined {
    return this.fields[key.toLowerCase()];
  }

  public getFieldValue(key: string): string {
    const field = this.getField(key.toLowerCase());

    if (!field) {
      throw new FieldReferenceError();
    }

    return field.get(this);
  }

  public getFieldValueOrDefault(key: string, def: string): string {
    const field = this.getField(key.toLowerCase());

    if (!field) {
      return def;
    }

    return field.get(this);
  }

  public getLink(path: string): Link {
    return new Link(this.project, this.id, path);
  }

  public hasOwnField(key: string): boolean {
    return Object.prototype.hasOwnProperty.call(this.fields, key.toLowerCase());
  }

  public addOwnField(key: string, field: Field): void {
    key = key.toLowerCase();

    if (!validFieldNameRegex.test(key)) {
      throw new IllegalFieldKeyError();
    }

    const hadField = !!this.fields[key];

    this.fields[key] = field;

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

  public getPath(): string {
    return this.path;
  }

  public setPath(path: string): void {
    if (!validPathRegex.test(path)) throw new IllegalPathError(path);

    this.path = path;
    this.emit('pathChanged');
  }

  public serialize(): LObject.SerializedData {
    const data: LObject.SerializedData = {
      type: this.type,
      id: this.id,
      parentId: this.parent && this.parent.id,
      path: this.path,
      ownFields: {}
    };

    for (const key of this.getOwnFieldNames()) {
      data.ownFields[key] = this.project.serializeField(this.fields[key]);
    }

    return data;
  }

  public static deserialize(
    project: Project,
    data: LObject.SerializedData
  ): LObject {
    const obj = new LObject(
      project,
      data.type,
      data.parentId && project.getObject(data.parentId) || null,
      data.path,
      data.id
    );

    for (const key in data.ownFields) {
      obj.addOwnField(key, project.deserializeField(data.ownFields[key]));
    }

    return obj;
  }
}

export default LObject;