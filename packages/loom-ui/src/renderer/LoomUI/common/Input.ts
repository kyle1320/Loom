import { UIComponent } from '../UIComponent';
import { makeElement } from '../util/dom';

export default class Input extends UIComponent<{
  change: string;
}, HTMLInputElement> {
  public constructor(value: string, disabled = false) {
    super(makeElement('input', {
      value,
      disabled,
      oninput: () => this.emit('change', this.el.value)
    }));
  }

  public set(val: string): void {
    this.el.value = val;
  }
}