import * as loom from 'loom-core';

import LoomUI from '..';
import { makeElement } from '../util/dom';
import NameList from '../common/NameList';
import { UIComponent } from '../UIComponent';

import './DefinitionNavigator.scss';

export default class DefinitionNavigator extends UIComponent {
  public constructor(ui: LoomUI) {
    super(makeElement('div', { className: 'definition-nav' }));

    const contentList = new NameList('Files', ui.sources.content)
      .on('select', data => ui.selectContentDef(data.value));
    const componentList = new NameList('Components', ui.sources.components)
      .on('select', data => ui.selectContentDef(data.value));

    this.listen(ui, 'updateContentDef', data => {
      if (data instanceof loom.ElementDef) {
        contentList.select(null);
        componentList.select(data);
      } else {
        contentList.select(data);
        componentList.select(null);
      }
    });

    this.appendChild(contentList);
    this.appendChild(componentList);
  }
}