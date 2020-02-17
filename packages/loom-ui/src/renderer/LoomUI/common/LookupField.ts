import * as loom from 'loom-core';

import { UIComponent } from '../UIComponent';
import Input from './Input';
import { makeElement } from '../util/dom';

import './LookupField.scss';

export default class LookupField extends UIComponent {
  private readonly input: Input;

  public constructor(
    title: string,
    map: loom.WritableStringMap<string>,
    key: string
  ) {
    super(makeElement('label', { className: 'property' }, title));

    const value = new loom.MapLookupValue(map, key);
    this.input = new Input('')
      .on('change', v => v ? value.set(v) : value.delete());

    this.appendChild(this.input);

    this.autoCleanup(value.watch(this.set));
    this.autoCleanup(() => value.destroy());
  }

  protected set = (value = ''): void => {
    this.input.set(value);
  }
}