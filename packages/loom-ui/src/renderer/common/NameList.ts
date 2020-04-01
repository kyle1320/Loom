import { DictionaryRow, WritableDictionary, WritableValue } from 'loom-data';

import Button from './Button';
import { UIComponent } from '@/UIComponent';
import { makeElement, toggleClass } from '@/util/dom';
import { showMenu } from '@/util/electron';

import './NameList.scss';

class NameListContent<T> extends UIComponent {
  private newRow: DictionaryRow<T> | null = null;

  public constructor(
    private readonly data: WritableDictionary<T>,
    private readonly selected: WritableValue<DictionaryRow<T> | null>
  ) {
    super(makeElement('div', { className: 'namelist__content' }));

    this.destroy.do(data.watch({
      addRow: key => {
        if (!this.newRow || this.newRow.key.get() !== key) {
          this.appendChild(
            new NameListRow(new DictionaryRow(data, key, null!), selected)
          )
        }
      }
    }));
  }

  public add(key: string, val: T): void {
    this.newRow = new DictionaryRow(this.data, key, val);
    const row = new NameListRow(this.newRow, this.selected);
    this.appendChild(row);
    row.edit();
  }
}

class EditableName extends UIComponent<{ blur: void }> {
  private editing = false;

  public constructor(private readonly value: WritableValue<string>) {
    super(makeElement('div', { className: 'namelist__title' }));

    this.destroy.do(value.watch(this.set));
  }

  private set = (value: string): void => {
    if (this.el instanceof HTMLInputElement) {
      this.el.value = value;
    } else {
      this.el.textContent = value;
    }
  }

  public edit(editing = true): void {
    if (this.editing === editing) return;

    if (this.el instanceof HTMLInputElement) {
      this.el.blur(); // save value
    }

    this.editing = editing;
    if (editing) {
      const el: HTMLInputElement = makeElement('input', {
        value: this.value.get(),
        className: 'namelist__title',
        onchange: () => {
          if (!this.value.set(el.value || '')) {
            this.set(this.value.get());
          }
        },
        onclick: e => e.stopPropagation(),
        onblur: () => this.edit(false)
      });
      this.changeEl(el);
      el.select();
      const dot = el.value.lastIndexOf('.');
      el.setSelectionRange(0, dot < 0 ? el.value.length : dot);
    } else {
      this.changeEl(
        makeElement('div', { className: 'namelist__title' }, this.value.get())
      );
      this.emit('blur');
    }
  }
}

class NameListRow<T> extends UIComponent<{}, HTMLElement> {
  private readonly title: EditableName;

  public constructor(
    row: DictionaryRow<T>,
    selected: WritableValue<DictionaryRow<T> | null>
  ) {
    const title = new EditableName(row.key);
    super(
      makeElement('div', {
        className: 'namelist__row',
        onclick: e => {
          e.stopPropagation();
          this.title.edit(false);
          row.exists() && selected.set(
            new DictionaryRow(row.map, row.key.get(), row.value.get())
          );
        },
        onkeydown: e => e.keyCode === 13 && this.el.click(),
        oncontextmenu: e => {
          e.preventDefault();
          showMenu([
            {
              label: 'Rename',
              click: () => title.edit()
            },
            {
              label: 'Delete',
              click: () => row.delete()
            }
          ]);
        },
        tabIndex: 0
      }),
      title
    );
    this.title = title;

    this.destroy.do(
      row.onOff('delete', this.destroy),
      title.onOff('blur', () => {
        if (!row.exists()) row.key.get() ? row.insert() : row.delete();
      }),
      selected.watch(r => {
        toggleClass(this.el, 'selected',
          !!(r && r.key.get() == row.key.get()));
      }),
      () => row.destroy()
    );
  }

  public edit(editing = true): void {
    this.title.edit(editing);
  }
}

interface NameListOptions {
  addButtonText?: string;
}

export default class NameList<T> extends UIComponent<{ add: void }> {
  public constructor(
    data: WritableDictionary<T>,
    factory: () => [string, T],
    options: NameListOptions = {},
    public readonly selected: WritableValue<DictionaryRow<T> | null>
    = new WritableValue<DictionaryRow<T> | null>(null)
  ) {
    super(makeElement('div', {
      className: 'namelist',
      onclick: () => selected.set(null)
    }));

    const content = new NameListContent<T>(data, selected);

    this.appendChild(content);
    this.appendChild(
      new Button('{i.fa.fa-plus} ' + (options.addButtonText || 'New'))
        .on('click', () => content.add(...factory()))
    );
  }
}