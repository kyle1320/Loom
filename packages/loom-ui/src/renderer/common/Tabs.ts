import { UIComponent } from '@/UIComponent';
import { makeElement } from '@/util/dom';

import './Tabs.scss';

class Tab<T extends string> extends UIComponent<{
  select: void;
}, HTMLElement> {
  public constructor(
    public readonly tab: T,
    name: string,
    icon: string,
    private selected: boolean
  ) {
    super(makeElement('div', {
      className: 'tab',
      onclick: () => this.select(),
      onkeydown: e => e.keyCode === 13 && this.select(),
      tabIndex: 0
    },
    makeElement('div', { className: 'tab__title' }, name),
    makeElement('i', { className: icon }))
    );

    this.select(selected);
  }

  public select(selected = true): void {
    this.el.classList.toggle('selected', selected);
    const wasSelected = this.selected;
    this.selected = selected;
    if (selected && selected !== wasSelected) {
      this.emit('select');
    }
  }
}

export default class Tabs<T extends string> extends UIComponent<{
  select: [T];
}> {
  private tabs: Tab<T>[] = [];

  public constructor(
    private readonly nameForTab: (tab: T) => string,
    private readonly iconForTab: (tab: T) => string
  ) {
    super(makeElement('div', { className: 'tabs' }));
  }

  public update(tabs: T[], selected: T): void {
    this.empty();
    this.tabs = [];

    for (const name of tabs) {
      const tab = new Tab(
        name,
        this.nameForTab(name),
        this.iconForTab(name),
        name === selected
      ).on('select', () => this.select(name));
      this.tabs.push(tab);
      this.appendChild(tab);
    }

    this.emit('select', selected);
  }

  private select = (tab: T): void => {
    this.tabs.forEach(t => t.select(t.tab === tab));
    this.emit('select', tab);
  }
}