import { List, WritableValue } from 'loom-data';

import Input from './Input';
import Select from './Select';
import { UIComponent } from '@/UIComponent';
import { NullableValue } from '@/util';
import { makeElement } from '@/util/dom';

import './ComboBox.scss';

export default class ComboBox extends UIComponent {
  public constructor(
    options: List<string>,
    value: WritableValue<string>,
    disabled?: boolean
  ) {
    const input = new Input(value, disabled);
    const selectValue = new NullableValue(value, '');
    const select = new Select(options, undefined, selectValue);
    super(makeElement('div', { className: 'combo-box' }), select, input);

    this.autoCleanup(() => selectValue.destroy());
  }
}