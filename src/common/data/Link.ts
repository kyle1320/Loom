import Project from './Project';
import Field from './Field';
import ObjectReferenceError from '../errors/ObjectReferenceError';
import FieldReferenceError from '../errors/FieldReferenceError';
import LObject from './LObject';
import LinkObserver from '../events/LinkObserver';

export default class Link {
  private object: LObject | null = null;

  public constructor(
    public readonly project: Project,
    public readonly objectId: string,
    public readonly fieldName: string,
    public readonly parent: Link | null = null
  ) {
    this.fieldName = fieldName.toLowerCase();
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
    yield* this.getObject().getFieldNames(this.fieldName);
  }

  public maybeGetField(): Field | undefined {
    return this.getObject().getField(this.fieldName);
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

    for (const key of object.getFieldNames()) {
      if (this.matchesKey(key)) {
        res[key] = object.getField(key)!;
      }
    }

    return res;
  }

  public getFieldValue(): string {
    return this.getObject().getFieldValue(this.fieldName);
  }

  public getFieldValueOrDefault(def: string): string {
    return this.getObject().getFieldValueOrDefault(this.fieldName, def);
  }

  public getFieldValues(): { [key: string]: string } {
    const object = this.getObject();
    const res: { [key: string]: string } = {};

    for (const key of object.getFieldNames()) {
      if (this.matchesKey(key)) {
        res[key] = object.getFieldValue(key)!;
      }
    }

    return res;
  }

  public observe(): LinkObserver {
    return new LinkObserver(this);
  }

  public matchesKey(key: string): boolean {
    return Link.pathMatches(this.fieldName, key);
  }

  public withParent(parent: Link): Link {
    return new Link(this.project, this.objectId, this.fieldName, parent);
  }

  public withProject(project: Project): Link {
    return new Link(project, this.objectId, this.fieldName, this.parent);
  }

  public withObject(objectId: string): Link {
    return new Link(this.project, objectId, this.fieldName, this.parent);
  }

  public withFieldName(fieldName: string): Link {
    return new Link(this.project, this.objectId, fieldName, this.parent);
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