import * as loom from 'loom-core';

import LoomUI from '..';
import { makeElement } from '../util/dom';
import NameList from '../common/NameList';
import { UIComponent } from '../UIComponent';

import './DefinitionNavigator.scss';

export default class DefinitionNavigator extends UIComponent {
  public constructor(ui: LoomUI) {
    super(makeElement('div', { className: 'definition-nav' }));

    const contentList = new NameList('Pages', ui.sources.pages)
      .on('select', (_, data) => ui.contentDef.set(data));
    const componentList = new NameList('Components', ui.sources.components)
      .on('select', (_, data) => ui.contentDef.set(data));

    this.autoCleanup(ui.contentDef.watch(data => {
      if (data instanceof loom.ElementDef) {
        contentList.select(null);
        componentList.select(data);
      } else {
        contentList.select(data);
        componentList.select(null);
      }
    }));

    this.appendChild(contentList);
    this.appendChild(componentList);
  }
}