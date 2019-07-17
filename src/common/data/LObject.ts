import Attribute from './Attribute';
import Project from './Project';

namespace LObject {
  export type SerializedData = {
    type: string,
    id: string,
    parentId: string | null,
    ownAttributes: Attribute.SerializedData[];
  };
}

var counter = 0;

class LObject {
  private attributes: { [id: string]: Attribute };

  public constructor(
    private project: Project,
    public readonly type: string,
    public readonly parent: LObject | null = null,
    public readonly id = String(counter++)
  ) {
    this.attributes = Object.create(parent && parent.attributes);

    project.objects.store(this);
  }

  public *getOwnAttributes() {
    for (var key of Object.getOwnPropertyNames(this.attributes)) {
      yield this.attributes[key];
    }
  }

  // attributes can use dots to indicate parts of a path
  public *getAttributes(path: string = '') {
    if (path) path += '.';

    for (var key in this.attributes) {
      if (key.startsWith(path)) yield this.attributes[key];
    }
  }

  public getAttribute(key: string): Attribute | undefined {
    return this.attributes[key];
  }

  public addOwnAttribute(key: string, value: string) {
    this.attributes[key] = new Attribute(this.project, this, key, value);
  }

  public serialize(): LObject.SerializedData {
    return {
      type: this.type,
      id: this.id,
      parentId: this.parent && this.parent.id,
      ownAttributes: [...this.getOwnAttributes()].map(attr => attr.serialize())
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

    data.ownAttributes
      .map(a => Attribute.deserialize(project, a, obj))
      .forEach(attr => obj.attributes[attr.key] = attr);

    return obj;
  }
}

export default LObject;