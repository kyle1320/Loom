import EditFrame from './EditFrame';
import LoomUI from '@/LoomUI';
import { UIComponent } from '@/UIComponent';
import { Floating } from '@/common';
import { makeElement } from '@/util/dom';

import './WYSIWYGEditor.scss';

export default class WYSIWYGEditor extends UIComponent {
  public constructor(ui: LoomUI) {
    super(makeElement('div', { className: 'wysiwyg-editor__container' }));

    const doc = ui.liveDoc.get()!;
    this.appendChild(new Floating(new UIComponent(
      makeElement('div', { className: 'wysiwyg-editor' }),
      doc,
      new EditFrame(doc)
    )));
  }
}