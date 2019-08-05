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

  public dependencies(context: LObject): Field.Dependency[] {
    return [
      { objectId: context.id, path: 'html.tag' },
      { objectId: context.id, path: 'html.attr.*' },
      { objectId: context.id, path: 'html.innerContent' }
    ];
  }

  public clone(): Field {
    return new ComponentContentField();
  }

  public serialize(): string {
    return '';
  }

  public static deserialize(): Field {
    return new ComponentContentField();
  }
}