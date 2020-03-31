import { DictionaryKeys, FilteredList, PrependList } from 'loom-data';
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
import { InlineStyleRuleDef } from '@/util/css';
import { isElement } from '@/util/html';
import C from '@/util/constants';

import './PropertiesEditor.scss';

type TabName = 'page' | 'component' | 'element' | 'text' | 'style';

function iconForTab(tab: TabName): string {
  switch (tab) {
    case 'page': return 'fa fa-file';
    case 'component': return 'fa fa-clone';
    case 'element': return 'fa fa-code';
    case 'text': return 'fa fa-font'
    case 'style': return 'fa fa-brush';
  }
}

function nameForTab(tab: TabName): string {
  switch (tab) {
    case 'page': return 'Page';
    case 'component': return 'Component';
    case 'element': return 'Element';
    case 'text': return 'Text';
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
    this.appendChild(
      this.toolbar = new UIContainer('properties-toolbar'));
    this.appendChild(
      this.contents = new UIContainer('properties-editor__content'));

    this.destroy.do(
      ui.data.watch(this.build),
      ui.content.onOff('change', this.build)
    );
  }

  private update(): void {
    this.toolbar.empty();
    this.contents.empty();

    const content = this.ui.contentDef.get();
    const data = this.ui.data.get();

    switch (this.selectedTab) {
      case 'page':
        this.toolbar.appendChild(new Input(content!.key));
        this.toolbar.appendChild(
          new IconButton('sep fa fa-trash')
            .on('click', () => content!.delete()));
        break;
      case 'component':
        if (data instanceof loom.Component) {
          this.toolbar.appendChild(new ComboBox(
            new DictionaryKeys<loom.ElementDef>(this.ui.sources.components),
            data.source.name
          ));
          this.toolbar.appendChild(
            new IconButton('sep fa fa-trash')
              .on('click', () => data.source.delete()));
        } else {
          this.toolbar.appendChild(new Input(content!.key));
          this.toolbar.appendChild(
            new IconButton('sep fa fa-trash')
              .on('click', () => content!.delete()));
        }
        break;
      case 'text':
        if (data instanceof loom.TextNode) {
          this.addField('Content', new TextArea(data.source.content));
        }
        if (data) {
          this.toolbar.appendChild(
            new IconButton('sep fa fa-trash')
              .on('click', () => data.source.delete()));
        }
        break;
      case 'element':
        if (data instanceof loom.Element) {
          this.toolbar.appendChild(new ComboBox(
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
          let node = data && this.ui.liveDoc.get()!.getNode(data);
          if (node && !isElement(node)) {
            node = node.parentElement || null;
          }
          const el = node && isElement(node) ? (node as HTMLElement) : null;

          const inline = el ? new InlineStyleRuleDef(el.style) : null;
          const matchingRules = new FilteredList(
            sheet.source.rules,
            rule => el ? el.matches(rule.selector.get()) : true
          );
          const all = new PrependList(
            inline ? [inline] : [],
            matchingRules
          );

          const selector = new WritableSelect(all, rule => rule.selector);
          selector.destroy.do(all);
          selector.destroy.do(matchingRules);
          inline && selector.destroy.do(inline);

          const rule = selector.selected;
          matchingRules.size() && rule.set(matchingRules.get(0));

          this.toolbar.appendChild(selector);
          this.toolbar.appendChild(new IconButton('fa fa-trash')
            .on('click', () => {
              selector.selected.get()?.delete();
            }));
          this.toolbar.appendChild(new IconButton('fa fa-plus')
            .on('click', () => {
              let selectorText = '*';
              if (node && isElement(node)) {
                selectorText = node.tagName.toLowerCase();
                if (node.classList.length) {
                  selectorText = '';
                  for (let i = 0; i < node.classList.length; i++) {
                    selectorText += '.' + node.classList.item(0);
                  }
                }
                if (node.id) selectorText = '#' + node.id;
              }
              const newRule = new loom.StyleRuleDef(selectorText, {});
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
      allTabs.push(data instanceof loom.Component
        ? 'component'
        : data instanceof loom.TextNode
          ? 'text'
          : 'element');
    }

    allTabs.push('style');

    if (allTabs.indexOf(this.selectedTab) < 0) {
      this.selectedTab = allTabs[0];
    }
    this.tabs.update(allTabs, this.selectedTab);
  }
}