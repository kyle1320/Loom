import * as loom from 'loom-core';

import IconButton from './IconButton';
import { UIComponent } from '../UIComponent';
import { makeElement } from '../util/dom';

import './KeyValueList.scss';

class KeyValueListHeader extends UIComponent<{ remove: void }> {
  public constructor(title: string) {
    super(
      makeElement('div', { className: 'keyvaluelist__header' },
        makeElement('div', { className: 'keyvaluelist__title' }, title)),
      new IconButton('fa-minus').on('click', () => this.emit('remove'))
    );
  }
}

class KeyValueListContent extends UIComponent<{ select: string | null }> {
  private newRow: KeyValueListRow;
  private rows: Record<string, KeyValueListRow> = {};

  public constructor(
    private readonly data: loom.WritableStringMap<string>
  ) {
    super(makeElement('div', { className: 'keyvaluelist__content' }));

    this.appendChild(this.newRow = new KeyValueListRow('', '')
      .on('changeKey', this.addNewRow)
    )

    for (const name of data.keys()) {
      this.setRow(name, data.get(name)!);
    }

    this.listen(data, 'set', ({ key, value }) => this.setRow(key, value));
    this.listen(data, 'delete', key => this.deleteRow(key));
  }

  private addNewRow = (key: string): void => {
    if (this.data.has(key)) {
      this.newRow.setKey('');
      return;
    }

    const row = this.newRow;
    key = this.data.normalizeKey(key);
    row.setKey(key);
    this.rows[key] = this.listenRow(
      row.off('changeKey', this.addNewRow), key);
    this.data.set(key, row.getValue());
    this.appendChild(
      this.newRow = new KeyValueListRow('', '')
        .on('changeKey', this.addNewRow)
    );
  }

  private listenRow(row: KeyValueListRow, key: string): KeyValueListRow {
    return row
      .on('changeValue', value => row.setKey(this.data.set(key, value)))
      .on('changeKey', newKey => this.changeKey(row, key, newKey))
      .on('select', () => this.emit('select', key))
      .on('deselect', () => this.emit('select', null));
  }

  private setRow(key: string, value: string): void {
    if (key in this.rows) {
      this.rows[key].setValue(value);
    } else {
      const row = this.listenRow(new KeyValueListRow(key, value), key);
      this.rows[key] = row;
      this.insertChild(row, this.children.length - 1);
    }
  }

  private deleteRow(key: string): void {
    const row = this.rows[key];
    delete this.rows[key];
    row.destroy();
  }

  private changeKey(
    row: KeyValueListRow,
    oldKey: string,
    newKey: string
  ): void {
    if (this.data.has(newKey)) {
      row.setKey(oldKey);
      return;
    }
    const value = this.data.get(oldKey) || '';
    this.data.delete(oldKey);
    if (newKey) row.setKey(this.data.set(newKey, value));
  }
}

class KeyValueListRow extends UIComponent<{
  select: void;
  deselect: void;
  changeValue: string;
  changeKey: string;
}, HTMLElement> {
  private readonly keyInput: HTMLInputElement;
  private readonly valueInput: HTMLInputElement;

  public constructor(key: string, value: string) {
    super(makeElement('div', { className: 'keyvaluelist__row' }));

    this.el.appendChild(this.keyInput = makeElement('input', {
      className: 'keyvaluelist__key-input',
      value: key,
      placeholder: 'Key',
      onchange: () => this.emit('changeKey', this.keyInput.value),
      onfocus: () => this.emit('select'),
      onblur: () => this.emit('deselect')
    }));

    this.el.appendChild(this.valueInput = makeElement('input', {
      className: 'keyvaluelist__value-input',
      value: value,
      placeholder: 'Value',
      oninput: () => this.emit('changeValue', this.valueInput.value),
      onfocus: () => this.emit('select'),
      onblur: () => this.emit('deselect')
    }));
  }

  public setKey(value: string): void {
    this.keyInput.value = value;
  }

  public setValue(value: string): void {
    this.valueInput.value = value;
  }

  public getValue(): string {
    return this.valueInput.value;
  }
}

export default class KeyValueList extends UIComponent {
  private selected: string | null = null;

  public constructor(title: string, data: loom.WritableStringMap<string>) {
    super(makeElement('div', { className: 'keyvaluelist' }),
      new KeyValueListHeader(title)
        .on('remove', () => this.selected && data.delete(this.selected)),
      new KeyValueListContent(data)
        .on('select', key => this.selected = key)
    );
  }
}