import LObject from '../../../common/data/LObject';
import Field from '../../../common/data/Field';
import Link from '../../../common/data/Link';
import ComponentContentFieldObserver from './ComponentContentFieldObserver';

export default class ComponentContentField implements Field {
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

  public observe(
    context: LObject,
    recursive: boolean
  ): ComponentContentFieldObserver {
    return new ComponentContentFieldObserver(this, context, recursive);
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