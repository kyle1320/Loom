import * as loom from 'loom-core';

import IconButton from './IconButton';
import { UIComponent } from '../UIComponent';

import './NameList.scss';
import { makeElement, toggleClass } from '../util/dom';

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

class NameListContent<T> extends UIComponent<{
  'select': [string | null];
}> {
  private rows: Record<string, NameListRow> = {};

  public constructor(data: loom.StringMap<T>) {
    super(makeElement('div', { className: 'namelist__content' }));

    this.autoCleanup(data.watch(this.setRow, this.deleteRow));
  }

  private setRow = (key: string): void => {
    if (!(key in this.rows)) {
      const row = new NameListRow(key)
        .on('select', key => this.emit('select', key));
      this.rows[key] = row;
      this.appendChild(row);
    }
  }

  private deleteRow = (name: string): void => {
    const row = this.rows[name];
    delete this.rows[name];
    row.destroy();
  }

  public select(selectedKey: string | null): void {
    for (const key in this.rows) {
      this.rows[key].select(selectedKey);
    }
  }
}

class NameListRow extends UIComponent<{
  select: [string | null];
}, HTMLElement> {
  private selected = false;

  public constructor(
    private readonly key: string
  ) {
    super(makeElement('div', {
      className: 'namelist__row',
      onclick: () => this.emit('select', this.key)
    }, key));
  }

  public select(key: string | null): void {
    this.selected = this.key === key;
    toggleClass(this.el, 'selected', this.selected);
  }
}

export default class NameList<T> extends UIComponent<{
  'add': void;
  'remove': void;
  'select': [loom.MapKey<T> | null];
}> {
  private content: NameListContent<T>;

  public constructor(
    title: string,
    data: loom.WritableStringMap<T>
  ) {
    super(makeElement('div', { className: 'namelist' }),
      new NameListHeader(title)
        .on('add', () => this.emit('add'))
        .on('remove', () => this.emit('remove'))
    );

    this.content = new NameListContent(data)
      .on('select', key => {
        this.emit('select', key === null ? key : new loom.MapKey(data, key))
      });

    this.appendChild(this.content);
  }

  public select(key: string | null): void {
    this.content.select(key);
  }
}