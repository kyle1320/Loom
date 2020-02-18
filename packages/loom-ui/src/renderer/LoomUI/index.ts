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
  public readonly contentDef: loom.WritableValue<ContentDefTypes | null>;
  public readonly content: loom.Value<ContentTypes | null>;
  public readonly data: loom.WritableValue<DataTypes | null>;

  public readonly globalStyles: loom.Sheet

  public constructor(
    public readonly sources: loom.Sources
  ) {
    super(document.getElementById('app')!);

    this.globalStyles = sources.styles.build(sources);

    this.contentDef = new loom.WritableValue<ContentDefTypes | null>(null);
    const content = new loom.WritableValue<ContentTypes | null>(null);
    this.content = content;
    this.data = new loom.WritableValue<DataTypes | null>(null);

    // when content changes, automatically build it & reset data
    this.content.watch((_, old) => old && old.destroy());
    this.contentDef.watch(def => {
      content.set(def && def.build(this.sources));
      this.data.set(null);
    });

    this.appendChild(new Navigator(this));
    this.appendChild(new Editor(this));
  }

  public destroy(): void {
    this.contentDef.set(null);
    super.destroy();
  }
}