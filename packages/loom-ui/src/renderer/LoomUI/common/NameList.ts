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
  'select': { key: string; value: T | null };
}> {
  private rows: Record<string, NameListRow<T>> = {};
  private selected: T | null = null;

  public constructor(data: loom.StringMap<T>) {
    super(makeElement('div', { className: 'namelist__content' }));

    for (const name of data.keys()) {
      this.setRow(name, data.get(name)!);
    }

    this.listen(data, 'set', ({ key, value }) => this.setRow(key, value));
    this.listen(data, 'delete', key => this.deleteRow(key));
  }

  private setRow(key: string, value: T): void {
    if (key in this.rows) {
      this.rows[key].setData(value, this.selected);
    } else {
      const row = new NameListRow(key, value)
        .on('select', value => this.emit('select', { key, value }));
      this.rows[key] = row;
      this.appendChild(row);
    }
  }

  private deleteRow(name: string): void {
    const row = this.rows[name];
    delete this.rows[name];
    row.destroy();
  }

  public select(data: T | null): void {
    for (const key in this.rows) {
      this.rows[key].select(data);
    }
  }
}

class NameListRow<T> extends UIComponent<{ 'select': T | null }, HTMLElement> {
  private selected = false;

  public constructor(
    name: string,
    private data: T
  ) {
    super(makeElement('div', {
      className: 'namelist__row',
      onclick: () => this.emit('select', this.selected ? null : this.data)
    }, name));
  }

  public setData(data: T, selected: T | null): void {
    this.data = data;
    this.select(selected);
  }

  public select(data: T | null): void {
    this.selected = this.data === data;
    toggleClass(this.el, 'selected', this.selected);
  }
}

export default class NameList<T> extends UIComponent<{
  'add': void;
  'remove': void;
  'select': { key: string; value: T | null };
}> {
  private content: NameListContent<T>;

  public constructor(
    title: string,
    data: loom.StringMap<T>
  ) {
    super(makeElement('div', { className: 'namelist' }),
      new NameListHeader(title)
        .on('add', () => this.emit('add'))
        .on('remove', () => this.emit('remove'))
    );

    this.content = new NameListContent(data)
      .on('select', data => this.emit('select', data));

    this.appendChild(this.content);
  }

  public select(data: T | null): void {
    this.content.select(data);
  }
}