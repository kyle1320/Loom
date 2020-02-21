import { WritableValue, StringMapRow, Value } from 'loom-data';
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
  public readonly pageDef:
  WritableValue<StringMapRow<loom.PageDef> | null>;
  public readonly componentDef:
  WritableValue<StringMapRow<loom.ElementDef> | null>;
  public readonly contentDef: WritableValue<
  StringMapRow<loom.PageDef> | StringMapRow<loom.ElementDef> | null>;
  public readonly content: Value<ContentTypes | null>;
  public readonly data: WritableValue<DataTypes | null>;

  public readonly globalStyles: loom.Sheet

  public constructor(
    public readonly sources: loom.Sources
  ) {
    super(document.getElementById('app')!);

    this.globalStyles = sources.styles.build(sources);

    this.pageDef = new WritableValue<
    StringMapRow<loom.PageDef> | null
    >(null);
    this.componentDef = new WritableValue<
    StringMapRow<loom.ElementDef> | null
    >(null);
    this.contentDef = new WritableValue<
    StringMapRow<loom.PageDef> | StringMapRow<loom.ElementDef> | null
    >(null);
    const content = new WritableValue<ContentTypes | null>(null);
    this.content = content;
    this.data = new WritableValue<DataTypes | null>(null);

    // when content changes, automatically build it & reset data
    this.content.watch((_, old) => {
      old && old.destroy();
      this.data.set(null);
    });
    this.pageDef.watch(def => {
      if (def) this.componentDef.set(null);
      this.contentDef.set(def);
    });
    this.componentDef.watch(def => {
      if (def) this.pageDef.set(null);
      this.contentDef.set(def);
    });
    this.contentDef.watch(def => {
      content.set(def && def.value.get()?.build(this.sources) || null);
    });

    this.appendChild(new Navigator(this));
    this.appendChild(new Editor(this));

    this.autoCleanup(() => content.set(null));
  }
}