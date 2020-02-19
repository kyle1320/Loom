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
      .on('select', key => ui.contentDef.set(key));
    const componentList = new NameList('Components', ui.sources.components)
      .on('select', key => ui.contentDef.set(key));

    this.autoCleanup(ui.contentDef.watch(data => {
      if (data?.value.get() instanceof loom.ElementDef) {
        contentList.select(null);
        componentList.select(data.get());
      } else {
        contentList.select(data && data.get());
        componentList.select(null);
      }
    }));

    this.appendChild(contentList);
    this.appendChild(componentList);
  }
}