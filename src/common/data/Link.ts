import Project from './Project';
import Field from './fields/Field';
import ObjectReferenceError from '../errors/ObjectReferenceError';
import FieldReferenceError from '../errors/FieldReferenceError';
import LObject from './objects/LObject';
import LinkObserver from '../events/LinkObserver';

export default class Link {
  private object: LObject | null = null;

  public readonly project: Project;
  public readonly objectId: string;
  public readonly fieldName: string;

  public constructor(object: LObject, fieldName: string);
  public constructor(project: Project, objectId: string, fieldName: string);
  public constructor(
    project: Project | LObject,
    objectId: string,
    fieldName?: string
  ) {
    if (typeof fieldName !== 'undefined') {
      this.project = project as Project;
      this.objectId = objectId;
      this.fieldName = fieldName.toLowerCase();
    } else {
      this.object = project as LObject;
      this.project = this.object.project;
      this.objectId = this.object.id;
      this.fieldName = objectId.toLowerCase();
    }
  }

  public getObject(): LObject {
    if (this.object) return this.object;

    if (!this.project) {
      throw new Error('Link is missing project');
    }

    const object = this.project.getObject(this.objectId);

    if (!object) {
      throw new ObjectReferenceError();
    }

    this.object = object;
    return object;
  }

  public getFieldName(): string {
    return this.fieldName;
  }

  public *getFieldNames(): IterableIterator<string> {
    const object = this.getObject();
    let path = this.fieldName;

    if (path in object.fields) {
      yield path;
    } else {
      let computed = false;
      if (path.endsWith('()')) {
        computed = true;
        path = path.substring(0, path.length - 2);
      }

      if (path.endsWith('*')) {
        path = path.substring(0, path.length - 1);
        for (const key in object.fields) {
          if (key.startsWith(path)) {
            if (key.endsWith('()') == computed) yield key;
          }
        }
      }
    }
  }

  public maybeGetField(): Field | undefined {
    return this.getObject().fields[this.fieldName];
  }

  public getField(): Field {
    const field = this.maybeGetField();

    if (!field) {
      throw new FieldReferenceError();
    }

    return field;
  }

  public getFields(): { [key: string]: Field } {
    const object = this.getObject();
    const res: { [key: string]: Field } = {};

    for (const key of this.getFieldNames()) {
      res[key] = object.fields[key];
    }

    return res;
  }

  public getFieldValue(): string {
    return this.getField().get(this.getObject());
  }

  public getFieldValueOrDefault(def: string): string {
    const field = this.maybeGetField();

    if (field) {
      return field.get(this.getObject());
    } else {
      return def;
    }
  }

  public getFieldValues(): { [key: string]: string } {
    const object = this.getObject();
    const res: { [key: string]: string } = {};

    for (const key of this.getFieldNames()) {
      res[key] = object.fields[key].get(object);
    }

    return res;
  }

  public observe(): LinkObserver {
    return new LinkObserver(this);
  }

  public matchesKey(key: string): boolean {
    return Link.pathMatches(this.fieldName, key);
  }

  public withProject(project: Project): Link {
    return new Link(project, this.objectId, this.fieldName);
  }

  public withObject(objectId: string): Link {
    return new Link(this.project, objectId, this.fieldName);
  }

  public withFieldName(fieldName: string): Link {
    return new Link(this.project, this.objectId, fieldName);
  }

  public toString(): string {
    return `{${this.objectId}|${this.fieldName}}`;
  }

  public static compare(a: Link, b: Link): number {
    return a.objectId < b.objectId ? -1 : a.objectId > b.objectId ? 1 :
      a.fieldName < b.fieldName ? -1 : a.fieldName > b.fieldName ? 1 : 0;
  }

  public static pathMatches(path: string, key: string): boolean {
    return path.endsWith('*')
      ? key.startsWith(path.substring(0, path.length - 1))
      : key === path;
  }
}