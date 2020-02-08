import { makeElement } from '../util/dom';
import LoomUI from '..';
import { UIComponent } from '../UIComponent';

import './Navigator.scss';

export default class Navigator extends UIComponent {
  public constructor(ui: LoomUI) {
    super(makeElement('div', { className: 'navigator' }));
  }
}