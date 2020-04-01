import { List, WritableValue } from 'loom-data';

import { UIComponent } from '@/UIComponent';
import { makeElement } from '@/util/dom';

class SelectOption<T> extends UIComponent<{}, HTMLOptionElement> {
  public constructor(
    source: T,
    watch: (value: T, cb: (name: string, subtitle?: string) => void)
    => (() => void) | void
  ) {
    super(makeElement('option'));

    this.destroy.do(watch(
      source,
      (name, subtitle) => {
        this.el.value = name;
        this.el.textContent = subtitle ? name + ' — ' + subtitle : name;
      }
    ) || null);
  }
}

export default class Select<T> extends UIComponent<{}, HTMLSelectElement> {
  public constructor(
    source: List<T> | Readonly<T[]>,
    watch: (value: T, cb: (name: string, subtitle?: string) => void)
    => (() => void) | void = (val, cb) => cb(String(val)),
    public readonly selected: WritableValue<T | null>
    = new WritableValue<T | null>(null)
  ) {
    super(makeElement('select'));

    const lst = source instanceof List ? source : new List(source);

    const update = (): void => {
      const index = this.el.selectedIndex;
      selected.set(index < 0 ? null : lst.get(index));
    };
    this.el.addEventListener('change', update);

    this.destroy.do(lst.watch(
      (index, value) => this.insertChild(new SelectOption(value, watch), index),
      (index, value) => {
        this.removeChild(index);
        if (value === selected.get()) selected.set(null);
      }
    ), selected.watch(value => {
      this.el.selectedIndex = value === null
        ? -1 : lst.asArray().indexOf(value);
    }));
  }
}