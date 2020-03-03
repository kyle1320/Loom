import { Value } from 'loom-data';
import { Sheet, StyleRule } from 'loom-core';

import { UIComponent } from '../../../UIComponent';
import { makeElement } from '../../../util/dom';
import Select from '../../../common/Select';
import KeyValueList from '../../../common/KeyValueList';

import './StylesEditor.scss';

class RuleEditor extends UIComponent {
  public constructor(rule: Value<StyleRule | null>) {
    super(makeElement('div', { className: 'rule-editor' }));

    this.autoCleanup(rule.watch(this.refresh));
  }

  private refresh = (rule: StyleRule | null): void => {
    this.empty();

    if (rule) {
      this.appendChild(new KeyValueList(rule.style.source));
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

    this.appendChild(selector);
    this.appendChild(new RuleEditor(selector.selected));
  }
}