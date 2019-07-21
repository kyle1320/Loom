import Field from '../../data/Field';
import LObject from '../../data/LObject';

export default class ComponentContentField extends Field {
  public get(context: LObject): string {
    const tag = context.getFieldValueOrDefault('html.tag', 'div');
    const attrs = [...context.getFieldNames('html.attr.*')]
      .map(f => ` ${f.substr(10)}="${context.getFieldValue(f)}"`)
      .join('');
    const content = context.getFieldValueOrDefault('html.innerContent', '');

    // TODO: handle self-closing tags
    return  `<${tag}${attrs}>${content}</${tag}>`;
  }

  public dependencies(context: LObject): string[] {
    return [
      `${context.id}|html.tag`,
      `${context.id}|html.attr.*`,
      `${context.id}|html.innerContent`
    ];
  }

  public clone(): Field {
    return new ComponentContentField();
  }

  public serialize(): Field.SerializedData {
    return {
      type: ComponentContentField.name,
      value: ''
    };
  }

  public static deserialize(): Field {
    return new ComponentContentField();
  }
}