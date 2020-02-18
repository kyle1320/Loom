import { UIComponent } from '../UIComponent';
import { makeElement } from '../util/dom';

export default class TextArea extends UIComponent<{
  change: string;
}, HTMLTextAreaElement> {
  public constructor(value: string, disabled = false) {
    super(makeElement('textarea', {
      value,
      disabled,
      oninput: () => this.emit('change', this.el.value)
    }));
  }

  public set(val: string): void {
    this.el.value = val;
  }
}