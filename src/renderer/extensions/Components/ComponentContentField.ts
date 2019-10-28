import LObject from '../../../common/data/LObject';
import Link from '../../../common/data/Link';
import ComputedField from '../../../common/data/ComputedField';

export default class ComponentContentField extends ComputedField {
  public get(context: LObject): string {
    const tag = context.getFieldValueOrDefault('html.tag', 'div');
    const attrs = [...context.getFieldNames('html.attr.*')]
      .map(f => ` ${f.substr(10)}="${context.getFieldValue(f)}"`)
      .join('');
    const content = context.getFieldValueOrDefault('html.innerContent', '');

    // TODO: handle self-closing tags
    return  `<${tag}${attrs}>${content}</${tag}>`;
  }

  public tag(context: LObject): Link {
    return context.getLink('html.tag');
  }

  public attrs(context: LObject): Link {
    return context.getLink('html.attr.*');
  }

  public content(context: LObject): Link {
    return context.getLink('html.innerContent');
  }

  public dependencies(context: LObject): Link[] {
    return [
      this.tag(context),
      this.attrs(context),
      this.content(context)
    ];
  }

  public static deserialize(): ComponentContentField {
    return new ComponentContentField();
  }
}