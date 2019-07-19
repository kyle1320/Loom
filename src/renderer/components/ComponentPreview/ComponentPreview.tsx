import LObject from "../../../common/data/LObject";
import { makeElement } from '../../util/dom';
import FieldReferenceError from "../../../common/errors/FieldReferenceError";

import "./ComponentPreview.scss";

export default class ComponentPreview {
  public readonly element: HTMLElement;
  public readonly content: HTMLElement;

  public constructor(private object: LObject) {
    this.element = <div className="preview">
      Preview: {this.content = <div className="preview__content"></div>}
    </div>;

    const field = object.getField('html.outerContent');

    if (!field) {
      throw new FieldReferenceError();
    }

    this.update = this.update.bind(this);

    field.on('update', this.update);
    this.update();
  }

  private update() {
    this.content.innerHTML = this.object.getFieldValue('html.outerContent');
  }
}