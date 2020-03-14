import * as electron from 'electron';
import { WritableValue, DictionaryRow, Value } from 'loom-data';
import * as loom from 'loom-core';

import Editor from './Editor';
import Navigator from './Navigator';
import { UIComponent } from './UIComponent';
import { makeElement } from './util/dom';

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
  public readonly data: WritableValue<DataTypes | null>;

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
      oldDef && oldDef.destroy();
      content.set(
        def && this.sources && def.value.get()?.build(this.sources) || null
      );
    });

    this.setSources(sources);

    this.destroy.do(() => this.setSources(null));
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
}

class WelcomePage extends UIComponent {
  public constructor(ui: LoomUI) {
    super(makeElement('div', { className: 'welcome-page '},
      makeElement('div', { className: 'welcome-page__heading' },
        'Welcome to Loom'
      ),
      makeElement('div', { className: 'welcome-page__subtitle' },
        'One Web Development Tool for Everyone'
      ),
      makeElement('div', { className: 'welcome-page__actions'},
        makeElement('div', {
          className: 'welcome-page__actions__btn',
          onclick: () => ui.create()
        }, 'Create a New Project'),
        makeElement('div', {
          className: 'welcome-page__actions__btn',
          onclick: () => ui.open()
        }, 'Open an Existing Project')
      )
    ));
  }
}