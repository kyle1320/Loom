import Field from './Field';
import Project from './Project';
import FieldReferenceError from '../errors/FieldReferenceError';
import IllegalFieldKeyError from '../errors/IllegalFieldKeyError';

namespace LObject {
  export interface SerializedData {
    type: string;
    id: string;
    parentId: string | null;
    ownFields: { [key: string]: Field.SerializedData };
  }

  export type FieldListener = (key: string) => void;
}

let counter = 0;

const validFieldNameRegex = /^[a-z0-9_.-]+$/;

/**
 * Returns a regular expression to match the given path.
 * Paths can contain wildcards using '*'.
 * @param path
 */
function getPathRegex(path: string): RegExp {
  return new RegExp(
    `^${path.toLowerCase()
      .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
      .replace('*', '.*')}$`
  );
}

class LObject {
  private fields: { [id: string]: Field };
  private listeners = new Map<string, Set<LObject.FieldListener>>();

  public constructor(
    public readonly project: Project,
    public readonly type: string,
    public readonly parent: LObject | null = null,
    public readonly id = String(counter++)
  ) {
    this.fields = Object.create(parent && parent.fields);
  }

  public *getOwnFieldNames(path: string = '*'): IterableIterator<string> {
    const regex = getPathRegex(path);

    for (const key of Object.getOwnPropertyNames(this.fields)) {
      if (regex.test(key)) yield key;
    }
  }

  public *getFieldNames(path: string = '*'): IterableIterator<string> {
    const regex = getPathRegex(path);

    for (const key in this.fields) {
      if (regex.test(key)) yield key;
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

    this.fields[key] = field;

    for (const [path, listeners] of this.listeners) {
      if (getPathRegex(path).test(key)) {
        for (const listener of listeners) {

          // TODO: call add-specific function?
          listener(key);
        }
      }
    }
  }

  public removeOwnField(key: string): void {
    key = key.toLowerCase();

    const field = this.fields[key];

    if (!field) return;

    delete this.fields[key];

    for (const [path, listeners] of this.listeners) {
      if (getPathRegex(path).test(key)) {
        for (const listener of listeners) {

          // TODO: call remove-specific function?
          listener(key);
        }
      }
    }
  }

  public addFieldListener(
    path: string,
    listener: LObject.FieldListener
  ): void {
    // TODO: register listener so that when any field on the given path changes,
    //       the listener is notified (passing the relevant key).
    // NOTE: be careful to properly handle inherited fields.
    //       for example, a -> b -> c, watching for a field via c, if a contains
    //       the watched field and the field gets added to b, we should stop
    //       watching the field on c and watch it on b instead.
    // This should listen for 'update' events on each field, as well as
    // recursively add field listeners to the dependencies of the fields.
    const listeners = this.listeners.get(path) || new Set();

    if (listeners.has(listener)) return;

    listeners.add(listener);
    this.listeners.set(path, listeners);

    for (const key of this.getFieldNames(path)) {
      const field = this.getField(key)!;

      // TODO: register this in a map so it can be removed
      const callback = (): void => listener(key);

      // TODO: take diff
      const updateDependencies = (): void => {
        field.dependencies(this).forEach(d => {
          const [objId, path] = d.split('|');
          const obj = this.project.getObject(objId);
          if (obj) {
            // TODO: register this in a map so it can be removed
            obj.addFieldListener(path, callback);
          }
        });
      };

      field.on('update', () => {
        updateDependencies();
        callback();
      });

      updateDependencies();
    }
  }

  public removeFieldListener(
    path: string,
    listener: LObject.FieldListener
  ): void {
    const listeners = this.listeners.get(path);

    // TODO: do more in-depth removal of listeners
    if (listeners) {
      listeners.delete(listener);

      if (listeners.size === 0) {
        this.listeners.delete(path);
      }
    }
  }

  public serialize(): LObject.SerializedData {
    const data: LObject.SerializedData = {
      type: this.type,
      id: this.id,
      parentId: this.parent && this.parent.id,
      ownFields: {}
    };

    for (const key of this.getOwnFieldNames()) {
      data.ownFields[key] = this.fields[key].serialize();
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