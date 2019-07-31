import Field from './Field';
import Project from './Project';
import FieldReferenceError from '../errors/FieldReferenceError';
import IllegalFieldKeyError from '../errors/IllegalFieldKeyError';
import IllegalPathError from '../errors/IllegalPathError';
import EventEmitter from '../util/EventEmitter';

namespace LObject {
  export interface SerializedData {
    type: string;
    id: string;
    parentId: string | null;
    ownFields: { [key: string]: string };
  }

  export type FieldListener = (key: string) => void;
}

let counter = 0;

const validFieldNameRegex = /^[a-z0-9_.-]+$/;
const validPathRegex = /^[a-zA-Z0-9/_.-]+$/;

function keyMatchesPath(key: string, path: string): boolean {
  path = path.toLowerCase();

  return path.endsWith('*')
    ? key.startsWith(path.substring(0, path.length - 1))
    : key === path;
}

function diff<T>(
  oldSorted: T[],
  newSorted: T[],
  onChange: (el: T, isAdd: boolean) => void
): void {
  let i = 0, j = 0;
  while (i < oldSorted.length || j < newSorted.length) {
    if (i >= oldSorted.length || oldSorted[i] > newSorted[j]) {
      onChange(newSorted[j], true);
      j++;
    } else if (j >= newSorted.length || oldSorted[i] < newSorted[j]) {
      onChange(oldSorted[i], false);
      i++;
    } else {
      i++;
      j++;
    }
  }
}

interface FieldListenerInfo {
  onRemove: () => void;
  updateListener: () => void;
  dependencies: string[];
  pathListeners: LObject.FieldListener[];
}

class LObject extends EventEmitter<{
  fieldAdded: string;
  fieldRemoved: string;
  pathChanged: void;
}> {
  private fields: { [id: string]: Field };
  private pathListeners = new Map<string, LObject.FieldListener[]>();
  private fieldListeners = new Map<string, FieldListenerInfo>();

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

    this.on('fieldAdded', key => {
      for (const [path, listeners] of this.pathListeners) {
        if (keyMatchesPath(key, path)) {
          for (const listener of listeners) {
            this._addFieldListener(key, listener);
            listener(key);
          }
        }
      }
    });

    this.on('fieldRemoved', key => {
      for (const [path, listeners] of this.pathListeners) {
        if (keyMatchesPath(key, path)) {
          for (const listener of listeners) {
            this._removeFieldListener(key, listener);
          }
        }
      }
    });

    if (parent) {
      parent.on('fieldAdded', key => {
        if (!this.hasOwnField(key)) {
          this.emit('fieldAdded', key);
        }
      });

      parent.on('fieldRemoved', key => {
        if (!this.hasOwnField(key)) {
          this.emit('fieldRemoved', key);
        }
      });
    }
  }

  public *getOwnFieldNames(path: string = '*'): IterableIterator<string> {
    path = path.toLowerCase();

    if (path.endsWith('*')) {
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

    if (path.endsWith('*')) {
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
      this.emit('fieldRemoved', key);
    }

    this.emit('fieldAdded', key);
  }

  public removeOwnField(key: string): void {
    key = key.toLowerCase();

    const field = this.fields[key];

    if (!field) return;

    delete this.fields[key];

    this.emit('fieldRemoved', key);

    if (this.fields[key]) {
      this.emit('fieldAdded', key);
    }
  }

  // Listeners are split into two 'parts': path listeners and field listeners.
  // Path listeners are per-path, are are the 'normal' way of viewing listeners.
  // Field listeners are used internally to implement path listeners.
  //   They keep track of which path listeners are associated with which fields.
  //     This way we can just associate a single listener with each field.
  //   Paths are added to field listeners when a path listener is registered,
  //     and when fields are added or removed.
  //   When a field updates, it calls its path listeners with its key,
  //     and also checks for updated dependencies.
  //     If its dependencies change, path listeners are added / removed
  //       to / from the appropriate objects.
  //     When a field in the path on those objects changes, each path listener
  //       is called with the key of the local (dependent) field.
  public addPathListener(
    path: string,
    listener: LObject.FieldListener
  ): void {
    const listeners = this.pathListeners.get(path) || [];

    if (listeners.some(l => l === listener)) return;

    listeners.push(listener);
    this.pathListeners.set(path, listeners);

    for (const key of this.getFieldNames(path)) {
      this._addFieldListener(key, listener);
    }
  }

  private _addFieldListener(
    key: string,
    listener: LObject.FieldListener
  ): void {
    const field = this.getField(key)!;
    let fieldInfo = this.fieldListeners.get(key);

    if (!fieldInfo) {
      const updatedField = (): void =>
        fieldInfo!.pathListeners.forEach(l => l(key));
      const updateDependencies = (newDeps: string[]): void => {
        diff(
          fieldInfo!.dependencies,
          newDeps,
          (dep: string, isAdd: boolean) => {
            const [objId, path] = dep.split('|');
            const obj = this.project.getObject(objId);
            if (obj) {
              if (isAdd) {
                obj.addPathListener(path, updatedField);
              } else {
                obj.removePathListener(path, updatedField);
              }
            }
          }
        );

        fieldInfo!.dependencies = newDeps;
      };

      fieldInfo = {
        onRemove: () => {
          updateDependencies([]);
          field.removeListener('update', fieldInfo!.updateListener);
        },
        updateListener: () => {
          updateDependencies(field.dependencies(this).sort());
          updatedField();
        },
        dependencies: [],
        pathListeners: []
      };
      this.fieldListeners.set(key, fieldInfo);

      updateDependencies(field.dependencies(this).sort());
      field.on('update', fieldInfo.updateListener);
    }

    fieldInfo.pathListeners.push(listener);
  }

  public removePathListener(
    path: string,
    listener: LObject.FieldListener
  ): void {
    const listeners = this.pathListeners.get(path);

    if (listeners) {
      const index = listeners.findIndex(l => l === listener);

      if (index < 0) return;

      const info = listeners.splice(index, 1)[0];

      for (const key of this.getFieldNames(path)) {
        this._removeFieldListener(key, info);
      }

      if (listeners.length === 0) {
        this.pathListeners.delete(path);
      }
    }
  }

  private _removeFieldListener(
    key: string,
    listener: LObject.FieldListener
  ): void {
    const fieldInfo = this.fieldListeners.get(key);

    if (fieldInfo) {
      const index = fieldInfo.pathListeners.indexOf(listener);

      if (index < 0) return;

      fieldInfo.pathListeners.splice(index, 1)[0];

      if (fieldInfo.pathListeners.length === 0) {
        fieldInfo.onRemove();
        this.fieldListeners.delete(key);
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

  public serialize(): LObject.SerializedData {
    const data: LObject.SerializedData = {
      type: this.type,
      id: this.id,
      parentId: this.parent && this.parent.id,
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
      data.id
    );

    for (const key in data.ownFields) {
      obj.addOwnField(key, project.deserializeField(data.ownFields[key]));
    }

    return obj;
  }
}

export default LObject;