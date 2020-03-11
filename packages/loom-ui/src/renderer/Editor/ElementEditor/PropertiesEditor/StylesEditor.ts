import { Value, DictionaryKeys, WritableValue } from 'loom-data';
import { Sheet, StyleRule } from 'loom-core';

import PropertyField from './PropertyField';
import { UIComponent } from '@/UIComponent';
import { Select, KeyValueList, Input, ColorPicker } from '@/common';
import { LookupValue } from '@/util';
import { makeElement } from '@/util/dom';

import './StylesEditor.scss';

class RuleEditor extends UIComponent {
  public constructor(rule: Value<StyleRule | null>) {
    super(makeElement('div', { className: 'rule-editor' }));

    this.autoCleanup(rule.watch(rule => {
      this.empty();

      if (rule) {
        const rows = new DictionaryKeys<string>(rule.style.source, true);
        rows.watch(
          (i, k) => this.insertChild(
            this.getEditor(k, new LookupValue(rule.style.source, k, '')), i
          ),
          i => this.removeChild(i)
        );
        return () => rows.destroy();
      }

      return null;
    }));
  }

  private getEditor(key: string, value: WritableValue<string>): UIComponent {
    switch (key) {
      case 'color':
        return new PropertyField('Font Color', new ColorPicker(value), key);
      default:
        return new PropertyField(key, new Input(value));
    }
  }
}

export default class StylesEditor extends UIComponent {
  public constructor(sheet: Sheet) {
    super(makeElement('div', { className: 'styles-editor' }));

    const selector = new Select(
      sheet.rules,
      (rule, cb) => rule.selector.watch(cb)
    );

    if (sheet.rules.size() > 0) {
      selector.selected.set(sheet.rules.get(0));
    }

    this.appendChild(selector);
    this.appendChild(new RuleEditor(selector.selected));
    this.appendChild(new UIComponent(makeElement('hr')));

    selector.selected.watch(rule => {
      if (rule) {
        const list = new KeyValueList(rule.style.source);
        this.appendChild(list);
        return () => list.destroy();
      }
      return null;
    });
  }
}