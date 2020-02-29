import { List, WritableValue } from 'loom-data';

import { UIComponent } from '../UIComponent';
import { makeElement } from '../util/dom';

class SelectOption<T> extends UIComponent<{}, HTMLOptionElement> {
  public constructor(
    source: T,
    watch: (value: T, cb: (name: string) => void) => () => void
  ) {
    super(makeElement('option'));

    this.autoCleanup(watch(
      source,
      name => this.el.textContent = name
    ));
  }
}

export default class Select<T> extends UIComponent<{}, HTMLSelectElement> {
  public constructor(
    source: List<T>,
    watch: (value: T, cb: (name: string) => void) => () => void,
    public readonly selected: WritableValue<T | null>
    = new WritableValue<T | null>(null)
  ) {
    super(makeElement('select'));

    const update = (): void => {
      const index = this.el.selectedIndex;
      selected.set(index < 0 ? null : source.get(index));
    };
    this.el.addEventListener('change', update);

    this.autoCleanup(selected.watch(value => {
      this.el.selectedIndex = value === null
        ? -1 : source.asArray().indexOf(value);
    }), source.watch(
      (index, value) => this.insertChild(new SelectOption(value, watch), index),
      index => this.removeChild(index)
    ));

    this.el.selectedIndex = 0;
    update();
  }
}