import { List } from 'loom-data';
import * as loom from 'loom-core';

import StylesEditor from './StylesEditor';
import LoomUI from '../../..';
import { UIComponent } from '../../../UIComponent';
import { LookupValue } from '../../../util';
import { makeElement, basicTags } from '../../../util/dom';
import Tabs from '../../../common/Tabs';
import Input from '../../../common/Input';
import ComboBox from '../../../common/ComboBox';
import TextArea from '../../../common/TextArea';
import MultiSelect from '../../../common/MultiSelect';
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

function nameForTab(tab: TabName): string {
  switch (tab) {
    case 'page': return 'Page';
    case 'element': return 'Element';
    case 'style': return 'Styles';
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
          this.addField('Class',
            new MultiSelect(new LookupValue(data.source.attrs, 'class')));
          this.appendChild(new UIComponent(makeElement('hr')));
          this.addField('Attributes', new KeyValueList(data.source.attrs));
        } else if (data instanceof loom.Component) {
          this.addField('Name', new Input(data.source.name));
        } else if (content instanceof loom.Element) {
          this.addField('Tag', new Input(content.source.tag));
          this.addField('Id',
            new Input(new LookupValue(content.source.attrs, 'id')));
          this.addField('Class',
            new MultiSelect(new LookupValue(content.source.attrs, 'class')));
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
        makeElement('div', { className: 'property-field__title' }, title)),
      input
    ));
  }
}

export default class PropertiesEditor extends UIComponent {
  private selectedTab!: TabName;
  private tabs: Tabs<TabName>;
  private contents: PropertyContents;

  public constructor(private readonly ui: LoomUI) {
    super(makeElement('div', { className: 'properties-editor' }));

    this.appendChild(this.tabs = new Tabs(nameForTab, iconForTab)
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
    this.tabs.update(allTabs, this.selectedTab);
  }
}