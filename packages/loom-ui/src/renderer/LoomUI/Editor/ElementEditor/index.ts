import WYSIWYGEditor from './WYSIWYGEditor';
import PropertiesEditor from './PropertiesEditor';
import { UIComponent } from '../../UIComponent';
import { makeElement } from '../../util/dom';
import LoomUI from '../..';

import './ElementEditor.scss';

export default class ElementEditor extends UIComponent {
  public constructor(ui: LoomUI) {
    super(makeElement('div', { className: 'element-editor' }),
      new WYSIWYGEditor(ui),
      new PropertiesEditor(ui)
    );
  }
}