import Field from './Field';
import Project from './Project';

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

class LObject {
  private fields: { [id: string]: Field };

  public constructor(
    public readonly type: string,
    public readonly parent: LObject | null = null,
    public readonly id = String(counter++)
  ) {
    this.fields = Object.create(parent && parent.fields);
  }

  public *getOwnFields() {
    for (var key of Object.getOwnPropertyNames(this.fields)) {
      yield this.fields[key];
    }
  }

  // fields can use dots to indicate parts of a path
  public *getFields(path: string = '') {
    if (path) path += '.';

    for (var key in this.fields) {
      if (key.startsWith(path)) yield this.fields[key];
    }
  }

  public getField(key: string): Field | undefined {
    return this.fields[key];
  }

  public addOwnField(field: Field) {
    this.fields[field.key] = field;
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

    data.ownFields
      .map(a => project.deserializeField(a))
      .forEach(attr => obj.fields[attr.key] = attr);

    return obj;
  }
}

export default LObject;