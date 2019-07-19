import Field from './Field';
import Project from './Project';
import FieldReferenceError from '../errors/FieldReferenceError';
import EventEmitter from '../util/EventEmitter';

namespace LObject {
  export type SerializedData = {
    type: string,
    id: string,
    parentId: string | null,
    ownFields: Field.SerializedData[];
  };

  export type Initializer = (obj: LObject) => any;
}

var counter = 0;

class LObject extends EventEmitter<{
  addField: Field,
  removeField: Field
}> {
  private fields: { [id: string]: Field };

  public constructor(
    public readonly type: string,
    public readonly parent: LObject | null = null,
    public readonly id = String(counter++)
  ) {
    super();

    this.fields = Object.create(parent && parent.fields);
  }

  public *getOwnFieldNames(): IterableIterator<string> {
    yield* Object.getOwnPropertyNames(this.fields);
  }

  // fields can use dots to indicate parts of a path
  public *getFieldNames(path: string = ''): IterableIterator<string> {
    if (path) path += '.';

    for (var key in this.fields) {
      if (key.startsWith(path)) yield key;
    }
  }

  public *getOwnFields(): IterableIterator<Field> {
    for (var key of this.getOwnFieldNames()) {
      yield this.getField(key)!;
    }
  }

  public *getFields(path: string = ''): IterableIterator<Field> {
    for (var key of this.getFieldNames(path)) {
      yield this.getField(key)!;
    }
  }

  public getField(key: string): Field | undefined {
    return this.fields[key];
  }

  public getFieldValue(key: string): string {
    var field = this.getField(key);

    if (!field) {
      throw new FieldReferenceError();
    }

    return field.get();
  }

  public addOwnField(factory: Field.Factory.ObjectStep) {
    var field = factory(this);
    this.fields[field.key] = field;
    this.emit('addField', field);
  }

  public serialize(): LObject.SerializedData {
    return {
      type: this.type,
      id: this.id,
      parentId: this.parent && this.parent.id,
      ownFields: [...this.getOwnFields()].map(attr => attr.serialize())
    };
  }

  public static deserialize(
    project: Project,
    data: LObject.SerializedData
  ): LObject {
    var obj = new LObject(
      data.type,
      data.parentId && project.getObject(data.parentId) || null,
      data.id
    );

    data.ownFields.map(f => obj.addOwnField(project.deserializeField(f)));

    return obj;
  }
}

export default LObject;