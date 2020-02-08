import LoomUI from '../../..';
import Floating from '../../../common/Floating';
import Frame from '../../../common/Frame';
import { makeElement } from '../../../util/dom';
import { UIComponent } from '../../../UIComponent';

import './WYSIWYGEditor.scss';

export default class WYSIWYGEditor extends UIComponent {
  public constructor(ui: LoomUI) {
    super(makeElement('div', { className: 'wysiwyg-editor' }),
      new Floating(new Frame(() => {
        // TODO
        return () => void 0;
      })));
  }
}