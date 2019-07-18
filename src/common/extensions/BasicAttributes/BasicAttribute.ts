import Attribute from "../../data/Attribute";
import EventEmitter from "../../util/EventEmitter";
import Project from "../../data/Project";
import LObject from "../../data/LObject";
import AttributeReferenceError from '../../errors/AttributeReferenceError';

export default class BasicAttribute extends EventEmitter<{
  update: void
}> implements Attribute {
  public readonly id: string;

  private value: string = '';
  private computed: string = '';
  private invalid: boolean = true;
  private links: string[] = [];

  public constructor(
    private project: Project,
    object: LObject,
    public readonly key: string,
    value: string
  ) {
    super();

    this.id = `${object.id}|${key}`;

    this.update = this.update.bind(this);
    this.set(value);

    project.attributes.store(this);
  }

  public set(value: string) {
    if (value === this.value) return;

    this.value = value;

    var links = this.getLinks().sort();
    diff(this.links, links, l => {
      var attr = this.project.attributes.fetch(l);

      if (attr) attr.on('update', this.update);
    }, l => {
      var attr = this.project.attributes.fetch(l);

      if (attr) attr.removeListener('update', this.update);
    });
    this.links = links;

    this.update();
  }

  public raw(): string {
    return this.value;
  }

  public get(): string {
    if (this.invalid) {
      this.computed = this.value.replace(/\{([^}]+)\}/g, (_, id) => {
        var attr = this.project.attributes.fetch(id);

        if (!attr) {
          throw new AttributeReferenceError();
        }

        return attr.get();
      });
    }

    return this.computed;
  }

  public computedParts(): (Attribute | string)[] {
    return this.value.split(/\{|\}/g).map((part, i) => {
      return (i % 2 == 0) ? part : this.project.attributes.fetch(part) || "";
    }).filter(Boolean);
  }

  private getLinks() {
    var re = /\{([^}]+)\}/g;
    var links = [];

    var matches = re.exec(this.value);
    while (matches) {
      links.push(matches[1]);

      matches = re.exec(this.value);
    }

    return links;
  }

  public update() {
    // TODO: if we are already invalid, does anyone care?
    this.invalid = true;
    this.emit('update');
  }

  public serialize(): Attribute.SerializedData {
    return {
      type: BasicAttribute.name,
      key: this.key,
      value: this.value
    };
  }

  public static deserialize(
    project: Project,
    data: Attribute.SerializedData,
    object: LObject
  ): Attribute {
    return new BasicAttribute(project, object, data.key, data.value);
  }
}

function diff<T>(
  oldSorted: T[],
  newSorted: T[],
  onAdd: (el: T) => any,
  onRemove: (el: T) => any
) {
  console.log(oldSorted, newSorted);
  var i = 0, j = 0;
  while (true) {
    if (i >= oldSorted.length) {
      if (j >= newSorted.length) {
        break;
      } else {
        console.log('add');
        onAdd(newSorted[j]);
        j++;
      }
    } else {
      if (j >= newSorted.length) {
        onRemove(oldSorted[i]);
        i++;
      } else {
        if (oldSorted[i] < newSorted[j]) {
          onRemove(oldSorted[i]);
          i++;
        } else if (oldSorted[i] > newSorted[j]) {
          onAdd(newSorted[j]);
          j++;
        }
      }
    }
  }
}