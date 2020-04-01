import * as electron from 'electron';
import { WritableValue, DictionaryRow, Value, MappedValue } from 'loom-data';
import * as loom from 'loom-core';

import Editor from './Editor';
import Navigator from './Navigator';
import LiveDocument from './LiveDocument';
import { UIComponent, UIContainer } from './UIComponent';
import { Button, Prompt } from './common';
import { makeElement } from './util/dom';
import {
  isValidChild,
  validChildren,
  supportsText,
  getElementName } from './util/html';
import C from './util/constants';

import './LoomUI.scss';

export type DataTypes
  = loom.Element
  | loom.TextNode
  | loom.Component
export type ContentTypes = loom.Page | loom.Element;
export type ContentDefTypes = loom.PageDef | loom.ElementDef;

export default class LoomUI extends UIComponent {
  public readonly selectedPage:
  WritableValue<DictionaryRow<loom.PageDef> | null>;
  public readonly selectedComponent:
  WritableValue<DictionaryRow<loom.ElementDef> | null>;
  public readonly contentDef:
  Value<DictionaryRow<loom.PageDef> | DictionaryRow<loom.ElementDef> | null>;
  public readonly content: Value<ContentTypes | null>;
  public readonly liveDoc: Value<LiveDocument | null>;
  public readonly data: WritableValue<DataTypes | null>;

  public prompt!: Prompt;

  private _sources!: loom.Sources | null;
  private _results: loom.Results | null = null;

  public constructor(sources: loom.Sources | null = null) {
    super(document.getElementById('app')!);

    this.selectedPage = new WritableValue<
    DictionaryRow<loom.PageDef> | null
    >(null);
    this.selectedComponent = new WritableValue<
    DictionaryRow<loom.ElementDef> | null
    >(null);
    const contentDef = this.contentDef = new WritableValue<
    DictionaryRow<loom.PageDef> | DictionaryRow<loom.ElementDef> | null
    >(null);
    const content = this.content = new WritableValue<ContentTypes | null>(null);
    this.liveDoc = new MappedValue(
      content,
      c => c && new LiveDocument(this, c),
      c => c && c.destroy()
    );
    this.data = new WritableValue<DataTypes | null>(null);

    // when content changes, automatically build it & reset data
    this.content.watch((_, old) => {
      old && old.destroy();
      this.data.set(null);
    });
    this.selectedPage.watch(def => {
      if (def) this.selectedComponent.set(null);
      contentDef.set(def);
    });
    this.selectedComponent.watch(def => {
      if (def) this.selectedPage.set(null);
      contentDef.set(def);
    });
    contentDef.watch((def, oldDef) => {
      if (def?.key.get() === oldDef?.key.get()) return;
      oldDef && oldDef.destroy();
      content.set(
        def && this.sources && def.value.get()?.build(this.sources) || null
      );
      return def && def.onOff('delete', () => contentDef.set(null));
    });
    this.data.watch(data => {
      return data && data.source.onOff('delete', () => this.data.set(null));
    })

    this.setSources(sources);

    this.destroy.do(() => this.close());
  }

  public get sources(): loom.Sources {
    return this._sources!;
  }

  public get results(): loom.Results {
    return this._results!;
  }

  private setSources(val: loom.Sources | null): void {
    if (val === this.sources) return;

    this.empty();
    if (this.sources) {
      this.results.destroy();
      this._results = null;
      this.selectedPage.set(null);
      this.selectedComponent.set(null);
    }

    this._sources = val;
    if (this.sources) {
      this._results = this.sources.build();
      this.appendChild(new Navigator(this));
      this.appendChild(new Editor(this));
    } else {
      this.appendChild(new WelcomePage(this));
    }

    this.appendChild(this.prompt = new Prompt());
  }

  public create(): void {
    this.setSources(new loom.Sources(null));
  }

  public open(): void {
    electron.remote.dialog.showOpenDialog({
      title: 'Open Project',
      filters: [{ name: 'Loom project', extensions: ['json'] }],
      properties: ['openFile', 'openDirectory']
    }).then(res => {
      if (!res.canceled && res.filePaths.length) {
        this.setSources(loom.Sources.loadFrom(res.filePaths[0]));
      }
    });
  }

  public save(): void {
    if (!this.sources) return;

    if (!this.sources.config) {
      electron.remote.dialog.showSaveDialog({
        properties: ['createDirectory']
      }).then(res => {
        if (!res.canceled && res.filePath) {
          this.sources?.saveTo(res.filePath);
        }
      });
    } else {
      this.sources.saveTo();
    }
  }

  public export(): void {
    if (!this.sources) return;

    electron.remote.dialog.showSaveDialog({
      title: 'Export Project',
      properties: ['createDirectory'],
      nameFieldLabel: 'Export As:'
    }).then(res => {
      if (!res.canceled && res.filePath) {
        this.results.exportTo(res.filePath);
      }
    });
  }

  public close(): void {
    // TODO: alert user to save before closing
    this.setSources(null);
  }

  public getAddMenu(el: loom.Element): electron.MenuItemConstructorOptions[] {
    const res: electron.MenuItemConstructorOptions[] = [];
    const components = [...el.sources.components.keys()].filter(name => {
      return isValidChild(el, el.sources.components.get(name)!);
    });
    const elements: electron.MenuItemConstructorOptions[] =
      (validChildren(el) || C.html.basicTags)
        .map(tag => {
          let label = tag;
          const name = getElementName(tag);
          if (name) label += ' — ' + name;
          return {
            label,
            click: () => this.data.set(
              el.children.addThrough(new loom.ElementDef(tag))
            )
          };
        });

    if (supportsText(el)) {
      elements.unshift({
        label: 'text',
        click: () => this.data.set(
          el.children.addThrough(new loom.TextNodeDef('text'))
        )
      }, {
        type: 'separator'
      });
    }

    res.push({
      label: 'Add Element',
      submenu: elements,
      enabled: elements.length > 0
    }, {
      label: 'Add Component',
      submenu: components.map(name => ({
        label: name,
        click: () => this.data.set(
          el.children.addThrough(new loom.ComponentDef(name))
        )
      })),
      enabled: components.length > 0
    });

    switch (el.tag.get()) {
      case 'head':
        res.push({
          label: 'Add Title',
          click: () => this.data.set(
            el.children.addThrough(new loom.ElementDef('title', {}, [
              new loom.TextNodeDef('title')
            ]))
          )
        });
        break;
      case 'table':
        res.push({
          label: 'Add Row',
          click: () => this.data.set(
            el.children.addThrough(new loom.ElementDef('tr'))
          )
        });
        break;
      case 'tr':
        res.push({
          label: 'Add Heading',
          click: () => this.data.set(
            el.children.addThrough(new loom.ElementDef('th'))
          )
        }, {
          label: 'Add Data',
          click: () => this.data.set(
            el.children.addThrough(new loom.ElementDef('td'))
          )
        });
    }

    return res;
  }
}

class WelcomePage extends UIComponent {
  public constructor(ui: LoomUI) {
    super(makeElement('div', { className: 'welcome-page '},
      makeElement('div', { className: 'welcome-page__heading' },
        'Welcome to Loom'
      ),
      makeElement('div', { className: 'welcome-page__subtitle' },
        'One Web Development Tool for Everyone'
      )
    ), new UIContainer(
      'welcome-page__actions',
      new Button('Create a New Project', 'primary', 'large')
        .on('click', () => ui.create()),
      new Button('Open an Existing Project', 'large')
        .on('click', () => ui.open()),
    ));
  }
}