import { DictionaryRow, WritableDictionary, WritableValue } from 'loom-data';

import IconButton from './IconButton';
import { UIComponent } from '@/UIComponent';
import { makeElement, toggleClass } from '@/util/dom';

import './NameList.scss';

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

class NameListRow<T> extends UIComponent {
  public constructor(
    row: DictionaryRow<T>,
    selected: WritableValue<DictionaryRow<T> | null>
  ) {
    super();

    const title = makeElement('div', { className: 'namelist__title' });
    const el = makeElement('div', {
      className: 'namelist__row',
      onclick: () => selected.set(
        new DictionaryRow(row.map, row.key.get(), row.value.get())
      )
    }, title);

    this.el = el;

    this.appendChild(
      new IconButton('fa fa-trash').on('click', () => row.delete())
    );

    this.autoCleanup(row.watch(
      key => title.textContent = key,
      () => { /**/ },
      () => this.destroy()
    ), selected.watch(r => {
      toggleClass(el, 'selected',
        !!(r && r.key.get() == row.key.get()));
    }), () => row.destroy());
  }
}

export default class NameList<T> extends UIComponent<{ add: void }> {
  public constructor(
    data: WritableDictionary<T>,
    public readonly selected: WritableValue<DictionaryRow<T> | null>
    = new WritableValue<DictionaryRow<T> | null>(null)
  ) {
    super(makeElement('div', { className: 'namelist' }));

    this.appendChild(new NameListContent<T>(data, selected));
  }
}