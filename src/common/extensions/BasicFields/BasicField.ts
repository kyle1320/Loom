import Field from '../../data/Field';
import Project from '../../data/Project';

function diff<T>(
  oldSorted: T[],
  newSorted: T[],
  onAdd: (el: T) => void,
  onRemove: (el: T) => void
): void {
  let i = 0, j = 0;
  while (i < oldSorted.length && j < newSorted.length) {
    if (i >= oldSorted.length || oldSorted[i] > newSorted[j]) {
      onAdd(newSorted[j]);
      j++;
    } else if (j >= newSorted.length || oldSorted[i] < newSorted[j]) {
      onRemove(oldSorted[i]);
      i++;
    } else {
      i++;
      j++;
    }
  }
}

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

  public set(value: string): void {
    if (value === this.value) return;

    this.value = value;

    const links = this.getLinks().sort();
    diff(this.links, links, l => {
      const split = l.split('|');
      const field = this.project.getField(split[0], split[1]);

      if (field) field.on('update', this.update);
    }, l => {
      const split = l.split('|');
      const field = this.project.getField(split[0], split[1]);

      if (field) field.removeListener('update', this.update);
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
        const split = l.split('|');
        return this.project.getFieldValue(split[0], split[1]);
      });
      this.invalid = false;
    }

    return this.computed;
  }

  private getLinks(): string[] {
    const re = /\{([^}]+)\}/g;
    const links = [];

    let matches = re.exec(this.value);
    while (matches) {
      links.push(matches[1]);

      matches = re.exec(this.value);
    }

    return links;
  }

  public update(): void {
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