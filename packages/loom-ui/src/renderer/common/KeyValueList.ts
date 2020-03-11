import { WritableDictionary, DictionaryRow } from 'loom-data';

import { UIComponent } from '../UIComponent';
import { makeElement, toggleClass } from '../util/dom';

import './KeyValueList.scss';

class KeyValueListContent extends UIComponent {
  private newRow!: DictionaryRow<string>;

  public constructor(
    private readonly data: WritableDictionary<string>
  ) {
    super(makeElement('div', { className: 'keyvaluelist__content' }));

    this.addNewRow();
    this.autoCleanup(data.watch({ addRow: this.addRow }));
  }

  private addNewRow = (): void => {
    this.appendChild(
      new KeyValueListRow(this.newRow = new DictionaryRow(this.data, '', ''))
    );
  }

  private addRow = (key: string, value: string): void => {
    if (key === this.newRow.key.get()) {
      this.addNewRow();
    } else {
      this.insertChild(
        new KeyValueListRow(new DictionaryRow(this.data, key, value)),
        this.numChildren() - 1
      );
    }
  }
}

class KeyValueListRow extends UIComponent<{}, HTMLElement> {
  public constructor(row: DictionaryRow<string>) {
    let removeBtn: HTMLElement;
    let keyInput: HTMLInputElement;
    let valueInput: HTMLInputElement;

    super(makeElement('div', { className: 'keyvaluelist__row' },
      removeBtn = makeElement('div', {
        className: 'icon-btn fa fa-minus',
        onclick: () => row.delete()
      }),
      keyInput = makeElement('input', {
        className: 'keyvaluelist__key-input',
        placeholder: 'Key',
        oninput: () => enableValueInput(),
        onchange: () => {
          const key = keyInput.value;
          if (key) {
            if (row.key.set(keyInput.value)) row.insert();
            else keyInput.value = row.key.get();
          } else {
            row.delete();
          }
          enableValueInput();
        }
      }),
      valueInput = makeElement('input', {
        className: 'keyvaluelist__value-input',
        placeholder: 'Value',
        oninput: () => row.value.set(valueInput.value)
      })
    ));

    const enableValueInput = (): void => {
      const disableValue = !keyInput.value;
      toggleClass(removeBtn, 'disabled', !row.key.get());
      toggleClass(valueInput, 'disabled', disableValue);
      valueInput.disabled = disableValue;
    };

    this.autoCleanup(row.watch(
      key => keyInput.value = key,
      value => valueInput.value = value || '',
      () => this.destroy()
    ),
    () => row.destroy());

    enableValueInput();
  }
}

export default class KeyValueList extends UIComponent {
  public constructor(data: WritableDictionary<string>) {
    super(makeElement('div', { className: 'keyvaluelist' }),
      new KeyValueListContent(data)
    );
  }
}