import { List, WritableValue, NullableValue } from 'loom-data';

import Input from './Input';
import Select from './Select';
import { UIComponent } from '@/UIComponent';
import { makeElement } from '@/util/dom';

import './ComboBox.scss';

export default class ComboBox extends UIComponent {
  public constructor(
    options: List<string> | Readonly<string[]>,
    value: WritableValue<string>,
    disabled?: boolean
  ) {
    const input = new Input(value, { disabled });
    const selectValue = new NullableValue(value, '');
    const select = new Select(options, undefined, selectValue);
    super(makeElement('div', {
      className: 'combo-box' + (disabled ? ' disabled' : '')
    }), input, select);

    this.destroy.do(() => selectValue.destroy());
  }
}