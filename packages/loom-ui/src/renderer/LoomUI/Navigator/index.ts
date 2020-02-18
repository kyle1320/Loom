import DefinitionNavigator from './DefinitionNavigator';
import DataNavigator from './DataNavigator';
import LoomUI from '..';
import { makeElement } from '../util/dom';
import { UIComponent } from '../UIComponent';

import './Navigator.scss';

export default class Navigator extends UIComponent {
  private showingData!: boolean;

  public constructor(
    private readonly ui: LoomUI
  ) {
    super(makeElement('div', { className: 'navigator' }));

    this.autoCleanup(ui.content.watch(content => this.update(!!content)));
  }

  private update = (showingData: boolean): void => {
    if (this.showingData !== showingData) {
      this.showingData = showingData;

      this.empty();

      this.appendChild(this.showingData
        ? new DataNavigator(this.ui)
          .on('back', () => this.ui.contentDef.set(null))
        : new DefinitionNavigator(this.ui));
    }
  }
}