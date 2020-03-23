import { UIComponent } from '@/UIComponent';
import { makeElement, toggleClass, parseContents } from '@/util/dom';

import './Button.scss';

type ButtonStyle = 'primary' | 'large';
export default class Button extends UIComponent<{ click: void }, HTMLElement> {
  public constructor(contents: string, ...styles: ButtonStyle[]) {
    super(makeElement('div', {
      className: 'btn' + styles.map(x => ' btn--' + x).join(''),
      onclick: e => {
        e.stopPropagation();
        this.emit('click');
      },
      onkeydown: e => e.keyCode == 13 && this.emit('click'),
      tabIndex: 0
    }, parseContents(contents)));
  }

  public disable(disabled = true): void {
    toggleClass(this.el, 'disabled', disabled);
  }
}