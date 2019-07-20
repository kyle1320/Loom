import Field from "../../data/Field";
import Project from "../../data/Project";

export default class BasicField extends Field {
  private value: string = '';
  private computed: string = '';
  private invalid: boolean = true;
  private links: string[] = [];

  private constructor(
    private project: Project,
    key: string,
    value: string
  ) {
    super(key);

    this.update = this.update.bind(this);
    this.set(value);
  }

  public set(value: string) {
    if (value === this.value) return;

    this.value = value;

    var links = this.getLinks().sort();
    diff(this.links, links, l => {
      var split = l.split('|');
      var attr = this.project.getField(split[0], split[1]);

      if (attr) attr.on('update', this.update);
    }, l => {
      var split = l.split('|');
      var attr = this.project.getField(split[0], split[1]);

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
      this.computed = this.value.replace(/\{([^}]+)\}/g, (_, l) => {
        var split = l.split('|');
        return this.project.getFieldValue(split[0], split[1]);
      });
      this.invalid = false;
    }

    return this.computed;
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

  public serialize(): Field.SerializedData {
    return {
      type: BasicField.name,
      key: this.key,
      value: this.value
    };
  }

  public static deserialize(
    data: Field.SerializedData
  ): Field.Factory {
    return BasicField.factory(data.key, data.value);
  }

  public static factory(key: string, value: string): Field.Factory {
    return project => () => new BasicField(project, key, value);
  }
}

function diff<T>(
  oldSorted: T[],
  newSorted: T[],
  onAdd: (el: T) => any,
  onRemove: (el: T) => any
) {
  var i = 0, j = 0;
  while (true) {
    if (i >= oldSorted.length) {
      if (j >= newSorted.length) {
        break;
      } else {
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