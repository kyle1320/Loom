import { UIComponent } from '../UIComponent';
import { makeElement } from '../util/dom';

export default class Input extends UIComponent<{
  change: string;
}, HTMLInputElement> {
  public constructor(value: string) {
    super(makeElement('input', {
      value,
      oninput: () => this.emit('change', this.el.value)
    }));
  }

  public set(val: string): void {
    this.el.value = val;
  }
}