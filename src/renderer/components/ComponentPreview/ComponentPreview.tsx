import LObject from '../../../common/data/LObject';
import { makeElement } from '../../util/dom';
import FieldReferenceError from '../../../common/errors/FieldReferenceError';

import './ComponentPreview.scss';

export default class ComponentPreview {
  public readonly element: HTMLElement;

  private readonly invalidNode = <span className="preview__invalid"/>;
  private content: ChildNode;
  private range: Range = document.createRange();

  public constructor(private object: LObject) {
    this.element = <div className="preview">
      Preview: {this.content = this.invalidNode}
    </div>;

    const field = object.getField('html.outerContent');

    if (!field) {
      throw new FieldReferenceError();
    }

    this.update = this.update.bind(this);

    object.addFieldListener('html.outerContent', this.update);
    this.update();
  }

  private update(): void {
    const html = this.object.getFieldValue('html.outerContent');
    const node = this.range.createContextualFragment(html)
      .firstChild || this.invalidNode;

    this.content.replaceWith(node);
    this.content = node;
  }
}