import { UIComponent } from '@/UIComponent';
import { makeElement } from '@/util/dom';

import './Floating.scss';

export default class Floating extends UIComponent<{ click: void }> {
  public constructor(...children: UIComponent[]) {
    super(makeElement('div', { className: 'floating__container' }),
      ...children);
  }
}