import DefinitionNavigator from './DefinitionNavigator';
import DataNavigator from './DataNavigator';
import LoomUI from '../LoomUI';
import { makeElement } from '../util/dom';
import { UIComponent } from '../UIComponent';

import './Navigator.scss';

export default class Navigator extends UIComponent {
  private showingData!: boolean;

  private readonly dataNav: DataNavigator;
  private readonly definitionNav: DefinitionNavigator;

  public constructor(
    private readonly ui: LoomUI
  ) {
    super(makeElement('div', { className: 'navigator' }));

    this.dataNav = new DataNavigator(this.ui)
      .on('back', () => this.showData(false));
    this.definitionNav = new DefinitionNavigator(this.ui);

    this.autoCleanup(ui.content.watch(content => this.showData(!!content)));
  }

  public showData = (showingData: boolean): void => {
    if (this.showingData !== showingData) {
      this.showingData = showingData;

      this.empty(false);

      this.appendChild(this.showingData ? this.dataNav : this.definitionNav);
    }
  }
}