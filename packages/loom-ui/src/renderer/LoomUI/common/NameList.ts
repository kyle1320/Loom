import { DictionaryRow, WritableDictionary, WritableValue } from 'loom-data';

import IconButton from './IconButton';
import { UIComponent } from '../UIComponent';
import { makeElement, toggleClass } from '../util/dom';

import './NameList.scss';

class NameListHeader extends UIComponent<{
  'add': void;
  'remove': void;
}> {
  public constructor(title: string) {
    super(
      makeElement('div', { className: 'namelist__header' },
        makeElement('div', { className: 'namelist__title' }, title)),
      new IconButton('fa-plus').on('click', () => this.emit('add')),
      new IconButton('fa-minus').on('click', () => this.emit('remove'))
    );
  }
}

class NameListContent<T> extends UIComponent {
  public constructor(
    data: WritableDictionary<T>,
    selected: WritableValue<DictionaryRow<T> | null>
  ) {
    super(makeElement('div', { className: 'namelist__content' }));

    this.autoCleanup(data.watch({
      addRow: key => this.appendChild(
        new NameListRow(new DictionaryRow(data, key, null!), selected)
      )
    }));
  }
}

class NameListRow<T> extends UIComponent<{}, HTMLElement> {
  public constructor(
    row: DictionaryRow<T>,
    selected: WritableValue<DictionaryRow<T> | null>
  ) {
    super(makeElement('div', {
      className: 'namelist__row',
      onclick: () => selected.set(
        new DictionaryRow(row.map, row.key.get(), row.value.get())
      )
    }));

    this.autoCleanup(row.watch(
      key => this.el.textContent = key,
      () => { /**/ },
      () => this.destroy()
    ), selected.watch(r => {
      toggleClass(this.el, 'selected',
        !!(r && r.key.get() == row.key.get()));
    }), () => row.destroy());
  }
}

export default class NameList<T> extends UIComponent<{ add: void }> {
  public constructor(
    title: string,
    data: WritableDictionary<T>,
    public readonly selected: WritableValue<DictionaryRow<T> | null>
    = new WritableValue<DictionaryRow<T> | null>(null)
  ) {
    super(makeElement('div', { className: 'namelist' }),
      new NameListHeader(title)
        .on('add', () => this.emit('add'))
        .on('remove', () => {
          selected.get()?.delete();
          selected.set(null);
        })
    );

    this.appendChild(new NameListContent<T>(data, selected));
  }
}