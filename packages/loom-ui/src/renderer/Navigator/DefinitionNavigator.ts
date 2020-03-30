import * as loom from 'loom-core';

import LoomUI from '@/LoomUI';
import { UIComponent } from '@/UIComponent';
import { NameList, Tabs } from '@/common';
import { makeElement } from '@/util/dom';

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

function getPageName(sources: loom.Sources, prefix = 'index'): string {
  let counter = 0;
  while (sources.pages.has(prefix + (counter || '') + '.html')) counter++;
  return prefix + (counter || '') + '.html';
}

function getComponentName(sources: loom.Sources, prefix = 'component'): string {
  let counter = 0;
  while (sources.components.has(prefix + (counter || ''))) counter++;
  return prefix + (counter || '');
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
        ? new NameList(
          this.ui.sources.pages,
          () => [getPageName(this.ui.sources), new loom.PageDef()],
          { addButtonText: 'New Page' },
          this.ui.selectedPage
        )
        : new NameList(
          this.ui.sources.components,
          () => [getComponentName(this.ui.sources), new loom.ElementDef('div')],
          { addButtonText: 'New Component' },
          this.ui.selectedComponent
        )
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