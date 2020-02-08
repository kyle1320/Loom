import * as loom from 'loom-core';

import Editor from './Editor';
import Navigator from './Navigator';
import { UIComponent } from './UIComponent';

import './LoomUI.scss';

export type DataTypes = loom.Node | loom.Rule;
export type ContentTypes = loom.Content | loom.Element;
export type ContentDefTypes = loom.ContentDef | loom.ElementDef;

export default class LoomUI extends UIComponent<{
  'updateContentDef': ContentDefTypes | null;
  'updateContent': ContentTypes | null;
  'updateData': DataTypes | null;
}> {
  private selectedContentDef: ContentDefTypes | null = null;
  private selectedContent: ContentTypes | null = null;
  private selectedData: DataTypes | null = null;

  public constructor(
    public readonly sources: loom.Sources
  ) {
    super(document.getElementById('app')!);

    this.appendChild(new Navigator(this));
    this.appendChild(new Editor(this));
  }

  public selectContentDef(def: ContentDefTypes | null): void {
    if (def === this.selectedContentDef) return;

    this.selectedContentDef = def;
    this.selectedContent?.destroy();
    this.selectedContent = def && def.build(this.sources);

    this.selectData(null);
    this.emit('updateContentDef', this.selectedContentDef);
    this.emit('updateContent', this.selectedContent);
  }

  public getSelectedContent(): ContentTypes | null {
    return this.selectedContent;
  }

  public getSelectedData(): DataTypes | null {
    return this.selectedData;
  }

  public selectData(data: DataTypes | null): void {
    if (data === this.selectedData) return;

    this.selectedData = data;
    this.emit('updateData', this.selectedData);
  }

  public destroy(): void {
    this.selectedContent?.destroy();
    super.destroy();
  }
}