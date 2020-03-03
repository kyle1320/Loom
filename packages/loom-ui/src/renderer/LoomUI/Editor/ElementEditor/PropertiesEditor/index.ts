import { List } from 'loom-data';
import * as loom from 'loom-core';

import StylesEditor from './StylesEditor';
import LoomUI from '../../..';
import { UIComponent } from '../../../UIComponent';
import { LookupValue } from '../../../util';
import { makeElement, basicTags } from '../../../util/dom';
import Input from '../../../common/Input';
import ComboBox from '../../../common/ComboBox';
import TextArea from '../../../common/TextArea';
import KeyValueList from '../../../common/KeyValueList';

import './PropertiesEditor.scss';

type TabName = 'page' | 'element' | 'style';

function iconForTab(tab: TabName): string {
  switch (tab) {
    case 'page': return 'fa fa-file';
    case 'element': return 'fa fa-code';
    case 'style': return 'fa fa-brush';
  }
}

class PropertyTab extends UIComponent<{
  'select': void;
}, HTMLElement> {
  public constructor(
    public readonly name: TabName,
    private selected: boolean
  ) {
    super(makeElement('div', {
      className: 'property-tab ' + iconForTab(name),
      onclick: () => this.select()
    }));

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

class PropertyTabHeader extends UIComponent<{
  'select': [TabName];
}> {
  private tabs: PropertyTab[] = [];

  public constructor() {
    super(makeElement('div', { className: 'properties-editor__header' }));
  }

  public update(tabs: TabName[], selected: TabName): void {
    this.empty();
    this.tabs = [];

    for (const name of tabs) {
      const tab = new PropertyTab(name, name === selected)
        .on('select', () => this.select(name));
      this.tabs.push(tab);
      this.appendChild(tab);
    }
  }

  private select = (name: TabName): void => {
    this.tabs.forEach(t => t.select(t.name === name));
    this.emit('select', name);
  }
}

class PropertyContents extends UIComponent {
  public constructor(
    private readonly ui: LoomUI,
    private selectedTab: TabName
  ) {
    super(makeElement('div', { className: 'properties-editor__content' }));

    this.autoCleanup(
      ui.data.watch(this.update),
      ui.content.watch(this.update)
    );

    this.update();
  }

  public select(name: TabName): void {
    if (this.selectedTab !== name) {
      this.selectedTab = name;
      this.update();
    }
  }

  public update = (): void => {
    this.empty();

    const data = this.ui.data.get();
    const content = this.ui.content.get();

    switch (this.selectedTab) {
      case 'page':
        if (content instanceof loom.Page) {
          this.addField('Location', new Input(this.ui.contentDef.get()!.key));
        } else if (content instanceof loom.Element) {
          this.addField('Name', new Input(this.ui.contentDef.get()!.key));
        }
        break;
      case 'element':
        if (data instanceof loom.TextNode) {
          this.addField('Content', new TextArea(data.source.content));
        } else if (data instanceof loom.Element) {
          this.addField('Tag', new ComboBox(
            new List(basicTags),
            data.source.tag,
            data instanceof loom.HeadElement ||
            data instanceof loom.BodyElement));
          this.addField('Id', new Input(
            new LookupValue(data.source.attrs, 'id')));
          this.addField('Attributes', new KeyValueList(data.source.attrs));
        } else if (data instanceof loom.Component) {
          this.addField('Name', new Input(data.source.name));
        } else if (content instanceof loom.Element) {
          this.addField('Tag', new Input(content.source.tag));
          this.addField('Id',
            new Input(new LookupValue(content.source.attrs, 'id')));
          this.addField('Attributes',  new KeyValueList(content.source.attrs));
        }
        break;
      case 'style':
        this.appendChild(new StylesEditor(this.ui.globalStyles));
        break;
    }
  }

  private addField(title: string, input: UIComponent): void {
    this.appendChild(new UIComponent(
      makeElement('label', { className: 'property-field' },
        makeElement('span', {}, title)),
      input
    ));
  }
}

export default class PropertiesEditor extends UIComponent {
  private selectedTab!: TabName;
  private tabHeader: PropertyTabHeader;
  private contents: PropertyContents;

  public constructor(private readonly ui: LoomUI) {
    super(makeElement('div', { className: 'properties-editor' }));

    this.appendChild(this.tabHeader = new PropertyTabHeader()
      .on('select', name => {
        this.selectedTab = name;
        this.contents.select(name);
      }));
    this.appendChild(
      this.contents = new PropertyContents(ui, this.selectedTab));

    this.autoCleanup(
      ui.data.watch(this.build),
      ui.content.onOff('change', this.build)
    );
  }

  private build = (): void => {
    const content = this.ui.content.get();
    const data = this.ui.data.get();
    const allTabs: TabName[] = [];

    if (data === null) {
      allTabs.push('page');
    }

    if (content instanceof loom.Element ||
        data instanceof loom.TextNode ||
        data instanceof loom.Element ||
        data instanceof loom.Component) {
      allTabs.push('element');
    }

    allTabs.push('style');

    if (allTabs.indexOf(this.selectedTab) < 0) {
      this.selectedTab = allTabs[0];
    }
    this.contents.select(this.selectedTab);
    this.tabHeader.update(allTabs, this.selectedTab);
  }
}