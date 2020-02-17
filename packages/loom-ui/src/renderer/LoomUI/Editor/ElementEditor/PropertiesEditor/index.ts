import * as loom from 'loom-core';

import LoomUI from '../../..';
import { UIComponent } from '../../../UIComponent';
import { LookupValue } from '../../../util';
import { makeElement } from '../../../util/dom';
import KeyValueList from '../../../common/KeyValueList';
import ValueField from '../../../common/ValueField';

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
        this.appendChild(new ValueField('Id',
          new LookupValue(data.source.attrs, 'id')));
        this.appendChild(new KeyValueList('Attributes', data.source.attrs));
      } else if (data instanceof loom.Component) {
        this.appendChild(new ValueField('Name', data.source.name));
      }
    }));
  }
}