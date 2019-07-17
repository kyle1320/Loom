import LObject from './LObject';
import AttributeReferenceError from '../errors/AttributeReferenceError';
import EventEmitter from '../util/EventEmitter';
import Project from './Project';
import IllegalArgumentKeyError from '../errors/IllegalArgumentKeyError';

const validityRegex = /^[a-zA-Z0-9_-.]+$/;

namespace Attribute {
  export type SerializedData = {
    key: string,
    value: string
  };
}

class Attribute extends EventEmitter<{
  change: void, // for raw value changes
  update: void  // for computed value changes
}> {
  public readonly id: string;

  public constructor(
    private project: Project,
    object: LObject,
    public readonly key: string,
    private val: string
  ) {
    super();

    if (!validityRegex.test(key)) {
      throw new IllegalArgumentKeyError(key);
    }

    this.id = `${object.id}.${key}`;

    project.attributes.store(this);
  }

  public set(value: string) {
    if (value === this.val) return;

    this.val = value;
    this.emit('change');
  }

  public raw(): string {
    return this.val;
  }

  public computed(): string {
    return this.val.replace(/\{([^}]+)\}/g, (_, id) => {
      var attr = this.project.attributes.fetch(id);

      if (!attr) {
        throw new AttributeReferenceError();
      }

      return attr.computed();
    });
  }

  public computedParts(): (Attribute | string)[] {
    return this.val.split(/\{|\}/g).map((part, i) => {
      return (i % 2 == 0) ? part : this.project.attributes.fetch(part) || "";
    }).filter(Boolean);
  }

  public getLinkedAttributes() {
    var re = /\{([^}]+)\}/g;
    var links = [];

    var matches = re.exec(this.val);
    while (matches) {
      links.push(matches[1]);

      matches = re.exec(this.val);
    }

    return links;
  }

  public serialize(): Attribute.SerializedData {
    return {
      key: this.key,
      value: this.val
    };
  }

  public static deserialize(
    project: Project,
    data: Attribute.SerializedData,
    object: LObject
  ): Attribute {
    return new Attribute(project, object, data.key, data.value);
  }
}

export default Attribute;