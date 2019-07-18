import Field from './Field';
import Project from './Project';
import BasicField from '../extensions/BasicFields/BasicField';

namespace LObject {
  export type SerializedData = {
    type: string,
    id: string,
    parentId: string | null,
    ownFields: Field.SerializedData[];
  };
}

var counter = 0;

class LObject {
  private fields: { [id: string]: Field };

  public constructor(
    private project: Project,
    public readonly type: string,
    public readonly parent: LObject | null = null,
    public readonly id = String(counter++)
  ) {
    this.fields = Object.create(parent && parent.fields);

    project.objects.store(this);
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

  public addOwnField(key: string, value: string) {
    this.fields[key] = new BasicField(this.project, this, key, value);
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
      project,
      data.type,
      data.parentId && project.objects.fetch(data.parentId) || null,
      data.id
    );

    data.ownFields
      .map(a => project.deserializeField(a, obj))
      .forEach(attr => obj.fields[attr.key] = attr);

    return obj;
  }
}

export default LObject;