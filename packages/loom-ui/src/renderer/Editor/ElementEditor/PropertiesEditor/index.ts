import { DictionaryKeys } from 'loom-data';
import * as loom from 'loom-core';

import PropertyField from './PropertyField';
import { RuleEditor } from './RuleEditor';
import LoomUI from '@/LoomUI';
import { UIComponent, UIContainer } from '@/UIComponent';
import {
  Input,
  TextArea,
  ComboBox,
  MultiSelect,
  KeyValueList,
  Tabs,
  IconButton,
  WritableSelect } from '@/common';
import { LookupValue } from '@/util';
import { makeElement } from '@/util/dom';
import C from '@/util/constants';

import './PropertiesEditor.scss';

type TabName = 'page' | 'component' | 'element' | 'style';

function iconForTab(tab: TabName): string {
  switch (tab) {
    case 'page': return 'fa fa-file';
    case 'component': return 'fa fa-clone';
    case 'element': return 'fa fa-code';
    case 'style': return 'fa fa-brush';
  }
}

function nameForTab(tab: TabName): string {
  switch (tab) {
    case 'page': return 'Page';
    case 'component': return 'Component';
    case 'element': return 'Element';
    case 'style': return 'Styles';
  }
}

export default class PropertiesEditor extends UIComponent {
  private selectedTab!: TabName;
  private tabs: Tabs<TabName>;
  private toolbar: UIContainer;
  private contents: UIContainer;

  public constructor(private readonly ui: LoomUI) {
    super(makeElement('div', { className: 'properties-editor' }));

    this.appendChild(this.tabs = new Tabs(nameForTab, iconForTab)
      .on('select', name => {
        this.selectedTab = name;
        this.update();
      }));
    this.appendChild(this.toolbar = new UIContainer(
      makeElement('div', { className: 'properties-toolbar' })
    ));
    this.appendChild(this.contents = new UIContainer(
      makeElement('div', { className: 'properties-editor__content' })
    ));

    this.destroy.do(
      ui.data.watch(this.build),
      ui.content.onOff('change', this.build)
    );
  }

  private update(): void {
    this.toolbar.empty();
    this.contents.empty();

    const data = this.ui.data.get();

    switch (this.selectedTab) {
      case 'page':
        this.addField('Location', new Input(this.ui.contentDef.get()!.key));
        this.toolbar.appendChild(
          new IconButton('sep fa fa-trash')
            .on('click', () => this.ui.contentDef.get()!.delete()));
        break;
      case 'component':
        this.addField('Name', new Input(this.ui.contentDef.get()!.key));
        this.toolbar.appendChild(
          new IconButton('sep fa fa-trash')
            .on('click', () => this.ui.contentDef.get()!.delete()));
        break;
      case 'element':
        if (data instanceof loom.TextNode) {
          this.addField('Content', new TextArea(data.source.content));
        } else if (data instanceof loom.Element) {
          this.addField('Tag', new ComboBox(
            C.html.basicTags,
            data.source.tag,
            data instanceof loom.HeadElement ||
            data instanceof loom.BodyElement));
          this.addField('Id', new Input(
            new LookupValue(data.source.attrs, 'id')));
          this.addField('Class',
            new MultiSelect(new LookupValue(data.source.attrs, 'class')));
          this.contents.appendChild(new UIComponent(makeElement('hr')));
          this.addField('Attributes', new KeyValueList(data.source.attrs));
        } else if (data instanceof loom.Component) {
          this.addField('Name', new ComboBox(
            new DictionaryKeys<loom.ElementDef>(this.ui.sources.components),
            data.source.name
          ));
        }
        if (data) {
          this.toolbar.appendChild(
            new IconButton('sep fa fa-trash')
              .on('click', () => data.source.delete()));
        }
        break;
      case 'style':
        (() => {
          const sheet = this.ui.results.styles;
          const selector = new WritableSelect(
            sheet.source.rules,
            rule => rule.selector
          );
          const rule = selector.selected;

          this.toolbar.appendChild(selector);
          this.toolbar.appendChild(new IconButton('fa fa-trash')
            .on('click', () => {
              selector.selected.get()?.delete();
            }));
          this.toolbar.appendChild(new IconButton('fa fa-plus')
            .on('click', () => {
              const newRule = new loom.StyleRuleDef('*', {});
              sheet.source.rules.add(newRule);
              selector.selected.set(newRule);
            }));
          this.contents.appendChild(new RuleEditor(rule));
        })();
        break;
    }
  }

  private addField(title: string, input: UIComponent): void {
    this.contents.appendChild(new PropertyField(title, input));
  }

  private build = (): void => {
    const content = this.ui.content.get();
    const data = this.ui.data.get();
    const allTabs: TabName[] = [];

    if (content && data === null) {
      allTabs.push(content instanceof loom.Element ? 'component' : 'page');
    }

    if (data) {
      allTabs.push('element');
    }

    allTabs.push('style');

    if (allTabs.indexOf(this.selectedTab) < 0) {
      this.selectedTab = allTabs[0];
    }
    this.tabs.update(allTabs, this.selectedTab);
  }
}