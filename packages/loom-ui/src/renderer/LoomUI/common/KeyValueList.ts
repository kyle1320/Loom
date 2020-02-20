import { WritableStringMap } from 'loom-data';

import { UIComponent } from '../UIComponent';
import { makeElement, toggleClass } from '../util/dom';

import './KeyValueList.scss';

class KeyValueListHeader extends UIComponent<{ remove: void }> {
  public constructor(title: string) {
    super(
      makeElement('div', { className: 'keyvaluelist__header' },
        makeElement('div', { className: 'keyvaluelist__title' }, title))
    );
  }
}

class KeyValueListContent extends UIComponent {
  private newRow: KeyValueListRow;
  private rows: Record<string, KeyValueListRow> = {};

  public constructor(
    private readonly data: WritableStringMap<string>
  ) {
    super(makeElement('div', { className: 'keyvaluelist__content' }));

    this.appendChild(
      this.newRow = new KeyValueListRow('', '').on('changeKey', this.addNewRow)
    );
    this.newRow.isNewRow();

    this.autoCleanup(data.watch(
      (key, value) => this.setRow(key, value),
      key => this.deleteRow(key)
    ));
  }

  private addNewRow = (): void => {
    const key = this.data.normalizeKey(this.newRow.getKey());
    if (this.data.has(key)) {
      this.newRow.setKey('');
      const row = this.rows[key];
      row && row.selectValue();
      return;
    }

    const row = this.newRow;
    row.setKey(key);
    this.rows[key] = this.listenRow(row.off('changeKey', this.addNewRow));
    this.data.set(key, row.getValue());
    this.appendChild(
      this.newRow = new KeyValueListRow('', '').on('changeKey', this.addNewRow)
    );
    this.newRow.isNewRow();
  }

  private listenRow(row: KeyValueListRow): KeyValueListRow {
    row.isNewRow(false);
    return row
      .on('changeValue',
        ({ key, value }) => row.setKey(this.data.set(key, value)))
      .on('changeKey',
        ({ oldKey, newKey }) => this.changeKey(row, oldKey, newKey))
      .on('delete', key => this.deleteRow(key));
  }

  private setRow(key: string, value: string): void {
    if (key in this.rows) {
      this.rows[key].setValue(value);
    } else {
      const row = this.listenRow(new KeyValueListRow(key, value));
      this.rows[key] = row;
      this.insertChild(row, this.children.length - 1);
    }
  }

  private deleteRow(key: string): void {
    const row = this.rows[key];
    delete this.rows[key];
    this.data.delete(key);
    row && row.destroy();
  }

  private changeKey(
    row: KeyValueListRow,
    oldKey: string,
    newKey: string
  ): void {
    newKey = this.data.normalizeKey(newKey);
    if (this.data.has(newKey)) {
      row.setKey(oldKey);
      return;
    }
    const value = this.data.get(oldKey) || '';
    delete this.rows[oldKey];
    this.data.delete(oldKey);
    if (newKey) {
      this.rows[newKey] = row;
      row.setKey(this.data.set(newKey, value));
    } else {
      row.destroy();
    }
  }
}

class KeyValueListRow extends UIComponent<{
  changeValue: { key: string; value: string };
  changeKey: { oldKey: string; newKey: string };
  delete: string;
}, HTMLElement> {
  private readonly removeBtn: HTMLElement;
  private readonly keyInput: HTMLInputElement;
  private readonly valueInput: HTMLInputElement;

  private key: string;

  public constructor(key: string, value: string) {
    super(makeElement('div', { className: 'keyvaluelist__row' }));

    this.key = key;

    this.el.appendChild(this.removeBtn = makeElement('div', {
      className: 'icon-btn fa fa-minus',
      onclick: () => this.emit('delete', this.getKey())
    }));

    this.el.appendChild(this.keyInput = makeElement('input', {
      className: 'keyvaluelist__key-input',
      value: key,
      placeholder: 'Key',
      oninput: () => this.enableValueInput(),
      onchange: () => {
        const oldKey = this.key;
        this.key = this.getKey();
        this.emit('changeKey', { oldKey, newKey: this.key });
      }
    }));

    this.el.appendChild(this.valueInput = makeElement('input', {
      className: 'keyvaluelist__value-input',
      value: value,
      placeholder: 'Value',
      oninput: () => this.emit('changeValue', {
        key: this.getKey(),
        value: this.getValue()
      })
    }));
  }

  public setKey(value: string): void {
    this.key = this.keyInput.value = value;
    this.enableValueInput();
  }

  public getKey(): string {
    return this.keyInput.value;
  }

  public setValue(value: string): void {
    this.valueInput.value = value;
  }

  public getValue(): string {
    return this.valueInput.value;
  }

  public selectValue(): void {
    this.valueInput.focus();
  }

  public isNewRow(isNewRow = true): void {
    toggleClass(this.removeBtn, 'disabled', isNewRow);
    this.enableValueInput(isNewRow || undefined);
  }

  private enableValueInput(disable = !this.getKey()): void {
    toggleClass(this.valueInput, 'disabled', disable);
    this.valueInput.disabled = disable;
  }
}

export default class KeyValueList extends UIComponent {
  public constructor(title: string, data: WritableStringMap<string>) {
    super(makeElement('div', { className: 'keyvaluelist' }),
      new KeyValueListHeader(title),
      new KeyValueListContent(data)
    );
  }
}