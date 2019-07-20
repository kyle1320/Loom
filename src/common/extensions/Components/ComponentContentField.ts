import Field from "../../data/Field";
import LObject from "../../data/LObject";

export default class ComponentContentField extends Field {
  private value: string = '';
  private invalid: boolean = true;

  private constructor(
    private object: LObject,
    key: string
  ) {
    super(key);

    this.update = this.update.bind(this);

    this.addFieldListener(object.getField('html.tag'));
    this.addFieldListener(object.getField('html.innerContent'));
    for (var attrField of object.getFields('html.attr')) {
      this.addFieldListener(attrField);
    }

    object.on('addField', f => {
      if (f.key === 'html.tag' ||
          f.key.startsWith('html.attr') ||
          f.key === 'html.innerContent') {
        this.update();
        this.addFieldListener(f);
      }
    });

    object.on('removeField', f => {
      if (f.key === 'html.tag' ||
          f.key.startsWith('html.attr') ||
          f.key === 'html.innerContent') {
        this.removeFieldListener(f);
      }
    });
  }

  public get(): string {
    if (this.invalid) {
      const tag = this.object.getFieldValue('html.tag');
      const attrs = [...this.object.getFields('html.attr')]
        .map(f => ` ${f.key.substr(10)}="${f.get()}"`)
        .join('');
      const content = this.object.getFieldValue('html.innerContent');

      // TODO: handle self-closing tags
      this.value = `<${tag}${attrs}>${content}</${tag}>`;
      this.invalid = false;
    }

    return this.value;
  }

  private update(): void {
    this.invalid = true;
    this.emit('update');
  }

  private addFieldListener(field: Field | undefined) {
    if (field) field.on('update', this.update);
  }

  private removeFieldListener(field: Field | undefined) {
    if (field) field.removeListener('update', this.update);
  }

  public serialize(): Field.SerializedData {
    return {
      type: ComponentContentField.name,
      key: this.key,
      value: ''
    };
  }

  public static deserialize(
    data: Field.SerializedData
  ): Field.Factory {
    return ComponentContentField.factory(data.key);
  }

  public static factory(key: string): Field.Factory {
    return () => (object) => new ComponentContentField(object, key);
  }
}