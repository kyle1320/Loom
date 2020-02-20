import { WritableValue } from 'loom-data';

import { UIComponent } from '../UIComponent';
import Input from './Input';
import { makeElement } from '../util/dom';

import './ValueField.scss';

export default class ValueField extends UIComponent {
  private readonly input: Input;

  public constructor(
    title: string,
    value: WritableValue<string>,
    disabled?: boolean
  ) {
    super(makeElement('label', { className: 'value-field' }, title));

    this.input = new Input('', disabled)
      .on('change', v => {
        value.set(v);
        this.input.set(value.get());
      });

    this.appendChild(this.input);

    this.autoCleanup(value.watch(this.set));
  }

  protected set = (value = ''): void => {
    this.input.set(value);
  }
}