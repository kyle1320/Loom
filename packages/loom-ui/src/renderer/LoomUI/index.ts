import { WritableValue, DictionaryRow, Value } from 'loom-data';
import * as loom from 'loom-core';

import Editor from './Editor';
import Navigator from './Navigator';
import { UIComponent } from './UIComponent';

import './LoomUI.scss';

export type DataTypes
  = loom.Element
  | loom.TextNode
  | loom.Component
  | loom.Rule;
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

  public readonly globalStyles: loom.Sheet

  public constructor(
    public readonly sources: loom.Sources
  ) {
    super(document.getElementById('app')!);

    this.globalStyles = sources.styles.build(sources);

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
      content.set(def && def.value.get()?.build(this.sources) || null);
    });

    this.appendChild(new Navigator(this));
    this.appendChild(new Editor(this));

    this.autoCleanup(() => content.set(null));
  }
}