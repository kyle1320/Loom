import { WritableValue } from 'loom-data';

import IconButton from './IconButton';
import { UIComponent } from '../UIComponent';
import { makeElement } from '../util/dom';

import './MultiSelect.scss';

class MultiSelectValue extends UIComponent<{ delete: void }> {
  public constructor(public readonly value: string) {
    super(
      makeElement('div', { className: 'multi-select__value' }, value),
      new IconButton('fa fa-times').on('click', () => this.emit('delete'))
    );
  }
}

class MultiSelectValues extends UIComponent {
  public constructor(private readonly values: WritableValue<string>) {
    super(makeElement('div', { className: 'multi-select__values' }));

    this.autoCleanup(values.watch(this.update));
  }

  public deleteLast(): void {
    if (this.children.length > 0) {
      this.children[this.children.length - 1].destroy();
      this.recalc();
    }
  }

  private recalc = (): void => {
    this.values.set(
      this.children.map(ch => (ch as MultiSelectValue).value).join(' ')
    );
  }

  private update = (val: string): void => {
    this.empty();
    for (const part of val.split(' ')) {
      if (part) {
        const value = new MultiSelectValue(part)
          .on('delete', () => {
            value.destroy();
            this.recalc();
          });
        this.appendChild(value);
      }
    }
  }
}

class MultiSelectInput extends UIComponent<{
  add: string;
  backspace: void;
}, HTMLInputElement> {
  public constructor() {
    super(makeElement('input', {
      className: 'multi-select__input',
      contentEditable: 'true',
      size: 2,
      onblur: () => this.update(),
      oninput: () => this.change(),
      onkeydown: e => {
        if (e.keyCode === 8 && !this.el.value) this.emit('backspace');
        else if (e.keyCode === 13) this.update();
      }
    }));
  }

  public select(): void {
    this.el.select();
  }

  private change(): void {
    if (this.el.value.match(/\s/)) this.update();
    else this.el.size = this.el.value.length + 1;
  }

  private update(): void {
    this.el.value.split(/\s/).forEach(val => val && this.emit('add', val));
    this.el.value = '';
    this.el.size = 1;
  }
}

export default class MultiSelect extends UIComponent<{}, HTMLDivElement> {
  public constructor(
    public readonly value: WritableValue<string>
  ) {
    super(makeElement('div', {
      className: 'multi-select',
      onclick: () => input.select()
    }));

    const values = new MultiSelectValues(value);
    const input = new MultiSelectInput()
      .on('add', this.addValue)
      .on('backspace', () => values.deleteLast());

    this.appendChild(values);
    this.appendChild(input);
  }

  private addValue = (value: string): void => {
    this.value.set(this.value.get() + ' ' + value);
  }
}