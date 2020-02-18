import WYSIWYGEditor, { WYSIWYGNode } from '.';
import { UIComponent } from '../../../UIComponent';
import { makeElement } from '../../../util/dom';

import './EditFrame.scss';

export default class EditFrame extends UIComponent<{}, HTMLElement> {
  private node: WYSIWYGNode | null = null;

  public constructor(
    editor: WYSIWYGEditor
  ) {
    super(makeElement('div', { className: 'edit-frame' }));

    editor.on('select', node => {
      this.node = node;
      this.refresh();
    });
  }

  public refresh = (): void => {
    const n = this.node?.getEl();
    const el = n
      ? n.nodeType === 3 ? n.parentElement : n as unknown as HTMLElement
      : null;
    if (el) {
      const bounds = el.getBoundingClientRect();
      this.el.style.display = 'block';
      this.el.style.top = (bounds.top) + 'px';
      this.el.style.left = (bounds.left) + 'px';
      this.el.style.width = (bounds.width) + 'px';
      this.el.style.height = (bounds.height) + 'px';
    } else {
      this.el.style.display = 'none';
    }
  }
}