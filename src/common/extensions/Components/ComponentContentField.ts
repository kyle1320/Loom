import Field from '../../data/Field';
import LObject from '../../data/LObject';
import Link from '../../data/Link';

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

  public dependencies(context: LObject): Link[] {
    return [
      context.getLink('html.tag'),
      context.getLink('html.attr.*'),
      context.getLink('html.innerContent')
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