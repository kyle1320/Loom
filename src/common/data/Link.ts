import Project from './Project';
import Field from './fields/Field';
import ObjectReferenceError from '../errors/ObjectReferenceError';
import FieldReferenceError from '../errors/FieldReferenceError';
import LObject from './objects/LObject';
import LinkObserver from '../events/LinkObserver';

export class HeadlessLink {
  protected readonly isComputed: boolean;
  protected readonly isWildcard: boolean;
  protected readonly rawPath: string;

  public constructor(
    public readonly objectId: string,
    public readonly fieldName: string
  ) {
    let rawPath = fieldName;

    const isComputed = rawPath.endsWith('()');
    if (isComputed) {
      rawPath = rawPath.substring(0, rawPath.length - 2);
    }

    const isWildcard = rawPath.endsWith('*');
    if (isWildcard) {
      rawPath = rawPath.substring(0, rawPath.length - 1);
    }

    this.isComputed = isComputed;
    this.isWildcard = isWildcard;
    this.rawPath = rawPath;
  }

  public attach(project: Project): Link {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    return new Link(project, this.objectId, this.fieldName);
  }

  public resolve(context: LObject): Link {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    return new Link(
      context.project,
      this.objectId || context.id, // if id is empty, resolve to 'this'
      this.fieldName
    );
  }

  public withObject(objectId: string): HeadlessLink {
    return new HeadlessLink(objectId, this.fieldName);
  }

  public withFieldName(fieldName: string): HeadlessLink {
    return new HeadlessLink(this.objectId, fieldName);
  }

  public toString(): string {
    return `{${this.objectId}|${this.fieldName}}`;
  }

  public matchesKey(key: string): boolean {
    if (!this.isWildcard) return key == this.fieldName;
    else if (this.isComputed !== key.endsWith('()')) return false;
    else return key.startsWith(this.rawPath);
  }
}

export default class Link extends HeadlessLink {
  private object: LObject | null = null;

  public constructor(
    public readonly project: Project,
    objectId: string,
    fieldName: string
  ) {
    super(objectId, fieldName.toLowerCase());
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

    if (this.isWildcard) {
      for (const key in object.fields) {
        if (this.matchesKey(key)) yield key;
      }
    } else if (this.fieldName in object.fields) {
      yield this.fieldName;
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

  public withObject(objectId: string): Link {
    return new Link(this.project, objectId, this.fieldName);
  }

  public withFieldName(fieldName: string): Link {
    return new Link(this.project, this.objectId, fieldName);
  }

  public static compare(a: Link, b: Link): number {
    return a.objectId < b.objectId ? -1 : a.objectId > b.objectId ? 1 :
      a.fieldName < b.fieldName ? -1 : a.fieldName > b.fieldName ? 1 : 0;
  }

  public static to(obj: LObject, fieldName: string): Link {
    const link = new Link(obj.project, obj.id, fieldName);
    link.object = obj;
    return link;
  }
}