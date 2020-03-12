import { WritableValue } from 'loom-data';

import { UIComponent } from '@/UIComponent';
import { makeElement } from '@/util/dom';

export default class Input extends UIComponent<{}, HTMLInputElement> {
  public constructor(
    public readonly value: WritableValue<string>,
    disabled = false
  ) {
    super(makeElement('input', {
      value: value.get(),
      disabled,
      oninput: () => value.set(this.el.value)
    }));

    this.destroy.do(value.watch(x => void (this.el.value = x)));
  }
}