import { DictionaryRow, WritableDictionary, WritableValue } from 'loom-data';

import { UIComponent } from '@/UIComponent';
import { makeElement, toggleClass } from '@/util/dom';
import { showMenu } from '@/util/electron';

import './NameList.scss';

class NameListContent<T> extends UIComponent {
  public constructor(
    data: WritableDictionary<T>,
    selected: WritableValue<DictionaryRow<T> | null>
  ) {
    super(makeElement('div', { className: 'namelist__content' }));

    this.destroy.do(data.watch({
      addRow: key => this.appendChild(
        new NameListRow(new DictionaryRow(data, key, null!), selected)
      )
    }));
  }
}

class EditableName extends UIComponent {
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
    } else {
      this.changeEl(
        makeElement('div', { className: 'namelist__title' }, this.value.get())
      );
    }
  }
}

class NameListRow<T> extends UIComponent<{}, HTMLElement> {
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
          selected.set(
            new DictionaryRow(row.map, row.key.get(), row.value.get())
          );
        },
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
        }
      }),
      title
    );

    this.destroy.do(
      row.onOff('delete', this.destroy),
      selected.watch(r => {
        toggleClass(this.el, 'selected',
          !!(r && r.key.get() == row.key.get()));
      }),
      () => row.destroy()
    );
  }
}

export default class NameList<T> extends UIComponent<{ add: void }> {
  public constructor(
    data: WritableDictionary<T>,
    public readonly selected: WritableValue<DictionaryRow<T> | null>
    = new WritableValue<DictionaryRow<T> | null>(null)
  ) {
    super(makeElement('div', {
      className: 'namelist',
      onclick: () => selected.set(null)
    }));

    this.appendChild(new NameListContent<T>(data, selected));
  }
}