import LObject from '../../../common/data/objects/LObject';
import Link from '../../../common/data/Link';
import ComputedField from '../../../common/data/fields/ComputedField';

export default class ComponentContentField extends ComputedField {
  public get(context: LObject): string {
    const tag = this.tag(context).getFieldValueOrDefault('div');
    const attrs = [...this.attrs(context).getFieldNames()]
      .map(f => ` ${f.substr(10)}="${context.fields[f].get(context)}"`)
      .join('');
    const content = this.content(context).getFieldValueOrDefault('');

    // TODO: handle self-closing tags
    return  `<${tag}${attrs}>${content}</${tag}>`;
  }

  public tag(context: LObject): Link {
    return Link.to(context, 'html.tag');
  }

  public attrs(context: LObject): Link {
    return Link.to(context, 'html.attr.*');
  }

  public content(context: LObject): Link {
    return Link.to(context, 'html.innercontent');
  }

  public dependencies(context: LObject): Link[] {
    return [
      this.tag(context),
      this.attrs(context),
      this.content(context)
    ];
  }
}