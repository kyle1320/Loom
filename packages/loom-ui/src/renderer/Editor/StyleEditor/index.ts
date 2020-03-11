import LoomUI from '../../LoomUI';
import { UIComponent } from '../../UIComponent';
import { makeElement } from '../../util/dom';

import './StyleEditor.scss';

export default class StyleEditor extends UIComponent {
  public constructor(ui: LoomUI) {
    super(makeElement('div', { className: 'style-editor' }));
  }
}