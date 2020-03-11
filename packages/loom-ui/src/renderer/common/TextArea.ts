import { WritableValue } from 'loom-data';

import { UIComponent } from '../UIComponent';
import { makeElement } from '../util/dom';

export default class TextArea extends UIComponent<{}, HTMLTextAreaElement> {
  public constructor(
    public readonly value: WritableValue<string>,
    disabled = false
  ) {
    super(makeElement('textarea', {
      value: value.get(),
      disabled,
      oninput: () => value.set(this.el.value)
    }));

    this.autoCleanup(value.watch(val => void (this.el.value = val)));
  }
}