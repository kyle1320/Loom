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
  ComboBox } from '@/common';
import { LookupValue } from '@/util';
import { makeElement } from '@/util/dom';
import C from '@/util/constants';

import './RuleEditor.scss';

export class RuleEditor extends UIComponent {
  public constructor(rule: Value<StyleRuleDef | null>) {
    super(makeElement('div', { className: 'rule-editor' }));

    this.destroy.do(rule.watch(rule => {
      this.empty();

      if (rule) {
        const rows = new DictionaryKeys<string>(rule.style, true);
        rows.watch(
          (i, k) => {
            const value = new LookupValue(rule.style, k, '');
            const comp = new PropertyField(
              this.getFriendlyName(k),
              this.getEditor(k, value),
              () => fetch(
                `https://developer.mozilla.org/en-US/docs/Web/CSS/${k}$json`
              ).then(res => res.ok && res.json())
                .then(json => json
                  ? json.summary.replace(/<a.*?>(.*?)<\/a>/g, '$1')
                  : 'Help info not found'
                ),
              k
            );
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

  private getFriendlyName(key: string): string {
    switch (key) {
      case 'border-bottom': return 'Border (bottom)';
      case 'color': return 'Font Color';
      case 'font-size': return 'Font Size';
      case 'white-space': return 'Whitespace';
      default: return key;
    }
  }

  private getEditor(key: string, value: WritableValue<string>): UIComponent {
    switch (key) {
      case 'color':
        return new MultiInput(
          new ColorPicker(value),
          new ComboBox(C.css.colors, value)
        );
      case 'font-size':
        return new UnitInput(value, C.css.units.all);
      case 'white-space':
        return new ComboBox(C.css.values.whiteSpace, value);
      default:
        return new Input(value);
    }
  }
}

class UnitInput extends MultiInput {
  public constructor(value: WritableValue<string>, units: string[]) {
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