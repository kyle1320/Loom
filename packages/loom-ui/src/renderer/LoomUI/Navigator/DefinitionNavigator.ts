import LoomUI from '..';
import { makeElement } from '../util/dom';
import NameList from '../common/NameList';
import { UIComponent } from '../UIComponent';

import './DefinitionNavigator.scss';

export default class DefinitionNavigator extends UIComponent {
  public constructor(ui: LoomUI) {
    super(makeElement('div', { className: 'definition-nav' }));

    const contentList = new NameList(
      'Pages', ui.sources.pages, ui.pageDef
    );
    const componentList = new NameList(
      'Components', ui.sources.components, ui.componentDef
    );

    this.appendChild(contentList);
    this.appendChild(componentList);
  }
}