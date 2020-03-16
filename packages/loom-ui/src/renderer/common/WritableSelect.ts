import { List, WritableValue, ProxyValue } from 'loom-data';

import Input from './Input';
import Select from './Select';
import { UIComponent } from '@/UIComponent';
import { makeElement } from '@/util/dom';

export default class WritableSelect<T> extends UIComponent {
  public readonly selected: WritableValue<T | null>;
  public constructor(
    options: List<T>,
    getValue: (val: T) => WritableValue<string>
  ) {
    super(makeElement('div', { className: 'combo-box' }));

    // string value
    const value = new ProxyValue('');
    const input = new Input(value);
    this.appendChild(input);

    // selected value
    this.selected = new WritableValue<T | null>(null);
    const select = new Select(
      options, (v, cb) => getValue(v).watch(cb), this.selected
    );
    this.appendChild(select);

    this.destroy.do(this.selected.watch(
      v => {
        if (!v && options.size()) this.selected.set(options.get(0));
        else value.source.set(v ? getValue(v) : null);
      }
    ), this.selected, value);
  }
}