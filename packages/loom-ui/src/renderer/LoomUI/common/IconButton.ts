import { makeElement } from '../util/dom';
import { UIComponent } from '../UIComponent';

import './IconButton.scss';

export default class IconButton extends UIComponent<{ click: void }> {
  public constructor(icon: string) {
    super(makeElement('div', {
      className: 'icon-btn fa ' + icon,
      onclick: () => this.emit('click')
    }));
  }
}