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
    public readonly fieldName: string
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

  public getField(): Field {
    const field = this.getObject().getField(this.fieldName);

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

  public getFieldValuesOrDefault(
    defFun: (key: string) => string
  ): { [key: string]: string } {
    const object = this.getObject();
    const res: { [key: string]: string } = {};

    for (const key of object.getFieldNames()) {
      if (this.matchesKey(key)) {
        res[key] = object.getFieldValueOrDefault(key, defFun(key));
      }
    }

    return res;
  }

  public observe(): LinkObserver {
    return new LinkObserver(this);
  }

  public matchesKey(key: string): boolean {
    return this.fieldName.endsWith('*')
      ? key.startsWith(this.fieldName.substring(0, this.fieldName.length - 1))
      : key === this.fieldName;
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

  public equals(other: Link): boolean {
    return this.objectId == other.objectId
      && this.fieldName == other.fieldName;
  }

  public toString(): string {
    return `{${this.objectId}|${this.fieldName}}`;
  }

  public static fromString(project: Project, str: string): Link | null {
    const match = str.match(/\^{([^}|]+)\|([^}]+)\}$/);

    if (!match) return null;

    return new Link(project, match[1], match[2]);
  }

  public static compare(a: Link, b: Link): number {
    return a.objectId < b.objectId ? -1 : a.objectId > b.objectId ? 1 :
      a.fieldName < b.fieldName ? -1 : a.fieldName > b.fieldName ? 1 : 0;
  }
}