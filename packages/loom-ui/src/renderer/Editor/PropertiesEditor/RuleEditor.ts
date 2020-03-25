import {
  Value,
  DictionaryKeys,
  WritableValue,
  ParsedValue } from 'loom-data';
import { StyleRuleDef } from 'loom-core';

import PropertyField from './PropertyField';
import { UIComponent } from '@/UIComponent';
import {
  Input,
  ColorPicker,
  MultiInput,
  ComboBox,
  SuggestiveInput } from '@/common';
import { LookupValue } from '@/util';
import { makeElement } from '@/util/dom';
import C from '@/util/constants';

import './RuleEditor.scss';

const styleSuggestions: SuggestiveInput.SuggestionValue[] = [];
for (const key in C.css.properties) {
  styleSuggestions.push({
    value: key
  });
}

export class RuleEditor extends UIComponent<{}, HTMLElement> {
  public constructor(rule: Value<StyleRuleDef | null>) {
    super(makeElement('div', { className: 'rule-editor' }));

    this.destroy.do(rule.watch(rule => {
      this.empty();

      if (rule) {
        this.appendChild(new UIComponent(makeElement('hr')));
        this.appendChild(
          new SuggestiveInput(
            styleSuggestions,
            'New Style Rule...',
            '{.fa.fa-plus}'
          ).on('submit', k => {
            // TODO: get current value from WYSIWYG editor
            const value = '';
            rule.style.has(k) || rule.style.set(k, value);
            this.select(k);
          })
        );
        const rows = new DictionaryKeys<string>(rule.style, true);
        rows.watch(
          (i, k) => {
            const value = new LookupValue(rule.style, k, '');
            const comp = new PropertyField(
              k,
              this.getEditor(k, value),
              {
                helpText: C.css.properties[k]?.summary,
                key: k,
                canDelete: true
              }
            ).on('delete', () => rule.style.delete(k));
            comp.destroy.do(value);
            this.insertChild(comp, i);
          },
          i => this.removeChild(i)
        );
        return () => rows.destroy();
      }

      return null;
    }));
  }

  private select(key: string): void {
    const el = this.el.querySelector('[data-key='+key+']');
    if (el instanceof HTMLElement) el.click();
  }

  private getEditor(key: string, value: WritableValue<string>): UIComponent {
    const info = C.css.properties[key] || { type: 'any' };
    switch (key) {
      case 'font-size':
        return new UnitInput(value, C.css.units.lengths);
      case 'white-space':
      default:
        switch (info.type) {
          case 'color':
            return new MultiInput(
              new ColorPicker(value),
              new ComboBox(C.css.colors, value)
            );
          case 'select':
            return new ComboBox(info.values, value);
          default:
            return new Input(value);
        }
    }
  }
}

class UnitInput extends MultiInput {
  public constructor(value: WritableValue<string>, units: Readonly<string[]>) {
    const parsed = new ParsedValue(
      value,
      v => {
        const parts = v.match(/^(.*?)([a-z%]*)$/i) || [];
        return {
          value: parts[1] || '',
          unit: parts[2] || ''
        };
      },
      data => data.value + data.unit
    );
    super(
      new Input(parsed.data.value, { type: 'number' }),
      new ComboBox(units, parsed.data.unit)
    );
    this.destroy.do(parsed);
  }
}