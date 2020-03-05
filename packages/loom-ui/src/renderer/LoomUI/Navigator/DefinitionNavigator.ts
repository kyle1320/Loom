import LoomUI from '..';
import { UIComponent } from '../UIComponent';
import { makeElement } from '../util/dom';
import Tabs from '../common/Tabs';
import NameList from '../common/NameList';

import './DefinitionNavigator.scss';

type TabName = 'pages' | 'components';

function iconForTab(tab: TabName): string {
  switch (tab) {
    case 'pages': return 'fa fa-file';
    case 'components': return 'fa fa-clone';
  }
}

function nameForTab(tab: TabName): string {
  switch (tab) {
    case 'pages': return 'Pages';
    case 'components': return 'Components';
  }
}

class DefinitionNavigatorContents extends UIComponent {
  private selected!: TabName;

  public constructor(
    private readonly ui: LoomUI,
  ) {
    super(makeElement('div', { className: 'definition-nav__content' }));
  }

  public select(selected: TabName): void {
    if (this.selected !== selected) {
      this.selected = selected;
      this.empty();
      this.appendChild(selected === 'pages'
        ? new NameList(this.ui.sources.pages, this.ui.selectedPage)
        : new NameList(this.ui.sources.components, this.ui.selectedComponent)
      );
    }
  }
}

export default class DefinitionNavigator extends UIComponent {
  public constructor(ui: LoomUI) {
    super(makeElement('div', { className: 'definition-nav' }));

    const content = new DefinitionNavigatorContents(ui);
    const tabs = new Tabs(nameForTab, iconForTab)
      .on('select', tab => content.select(tab));

    tabs.update(['pages', 'components'], 'pages');

    this.appendChild(tabs);
    this.appendChild(content);
  }
}