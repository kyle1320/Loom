import { UIComponent } from '@/UIComponent';
import { makeElement } from '@/util/dom';

import './IconButton.scss';

export default class IconButton extends UIComponent<{
  click: void;
  focus: void;
  blur: void;
}> {
  public constructor(icon: string, options: { disabled?: boolean } = {}) {
    super(makeElement('div', {
      className: `icon-btn${options.disabled ? ' icon-btn--disabled' : ''} fa `
        + icon,
      onclick: e => {
        if (options.disabled) return;

        e.preventDefault();
        e.stopPropagation();
        this.emit('click');
      },
      onfocus: () => this.emit('focus'),
      onblur: () => this.emit('blur'),
      onkeydown: e => e.keyCode == 13 && this.emit('click'),
      tabIndex: 0,
    }));
  }
}