import * as loom from 'loom-core';

import LoomUI from '../../..';
import { UIComponent } from '../../../UIComponent';
import { makeElement } from '../../../util/dom';
import Input from '../../../common/Input';
import KeyValueList from '../../../common/KeyValueList';

import './PropertiesEditor.scss';

export default class PropertiesEditor extends UIComponent {
  public constructor(ui: LoomUI) {
    super(makeElement('div', { className: 'properties-editor' }));

    this.autoCleanup(ui.onOff('updateData', data => {
      this.empty();

      if (data instanceof loom.TextNode) {
        this.appendChild(new ValueField('Content', data.source.content));
      } else if (data instanceof loom.Element) {
        this.appendChild(new ValueField('Tag', data.source.tag));
        this.appendChild(new KeyField('Id', data.source.attrs, 'id'));
        this.appendChild(new KeyValueList('Attributes', data.source.attrs));
      } else if (data instanceof loom.Component) {
        this.appendChild(new ValueField('Name', data.source.name));
      }
    }));
  }
}

class ValueField extends UIComponent {
  private readonly input: Input;

  public constructor(
    title: string,
    value: loom.WritableValue<string>
  ) {
    super(makeElement('label', { className: 'property' }, title));

    this.input = new Input('').on('change', v => value.set(v));

    this.appendChild(this.input);

    this.autoCleanup(value.watch(this.set));
  }

  protected set = (value = ''): void => {
    this.input.set(value);
  }
}

class KeyField extends UIComponent {
  private readonly input: Input;

  public constructor(
    title: string,
    map: loom.WritableStringMap<string>,
    key: string
  ) {
    super(makeElement('label', { className: 'property' }, title));

    const value = new loom.MapLookupValue(map, key);
    this.input = new Input('').on('change', v => value.set(v));

    this.appendChild(this.input);

    this.autoCleanup(value.watch(this.set));
  }

  protected set = (value = ''): void => {
    this.input.set(value);
  }
}