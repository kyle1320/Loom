import * as loom from 'loom-core';

import { UIComponent } from '../UIComponent';
import TextArea from './TextArea';
import { makeElement } from '../util/dom';

import './TextField.scss';

export default class TextField extends UIComponent {
  private readonly input: TextArea;

  public constructor(
    title: string,
    value: loom.WritableValue<string>
  ) {
    super(makeElement('label', { className: 'text-field' }, title));

    this.input = new TextArea('').on('change', v => value.set(v));

    this.appendChild(this.input);

    this.autoCleanup(value.watch(this.set));
  }

  protected set = (value = ''): void => {
    this.input.set(value);
  }
}