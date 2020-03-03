import { WritableValue } from 'loom-data';

import IconButton from './IconButton';
import { UIComponent } from '../UIComponent';
import { makeElement } from '../util/dom';

import './MultiSelect.scss';

class MultiSelectValue extends UIComponent {
  public constructor(value: string) {
    super(
      makeElement('div', {
        className: 'multi-select__value',
        contentEditable: 'false'
      }, value),
      // TODO: update value on destroy
      new IconButton('fa fa-times').on('click', () => this.destroy())
    );
  }
}

export default class MultiSelect extends UIComponent {
  public constructor(
    public readonly value: WritableValue<string>
  ) {
    super(makeElement('div', {
      className: 'multi-select',
      contentEditable: 'true',
      onblur: () => this.updateValue(),
      onkeyup: e => e.keyCode === 32 && this.updateValue()
    }));

    this.autoCleanup(value.watch(this.refresh));
  }

  private updateValue = (): void => {
    // TODO: better whitespace handling, cursor replacement
    const str = this.el.textContent || '';
    this.value.set(str.trim());
  }

  private refresh = (val: string): void => {
    this.empty();
    this.el.textContent = '';
    for (const part of val.split(' ')) {
      if (part) {
        this.el.appendChild(document.createTextNode(''));
        this.appendChild(new MultiSelectValue(part));
      }
    }
    this.el.appendChild(document.createTextNode(''));
  }
}