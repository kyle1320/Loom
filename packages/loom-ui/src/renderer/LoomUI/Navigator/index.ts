import DefinitionNavigator from './DefinitionNavigator';
import DataNavigator from './DataNavigator';
import LoomUI from '..';
import { makeElement } from '../util/dom';
import { UIComponent } from '../UIComponent';

import './Navigator.scss';

export default class Navigator extends UIComponent {
  public constructor(ui: LoomUI) {
    super(makeElement('div', { className: 'navigator' }),
      new DefinitionNavigator(ui),
      new DataNavigator(ui)
    );
  }
}