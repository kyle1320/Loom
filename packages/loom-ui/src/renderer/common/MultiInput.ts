import { UIComponent } from '@/UIComponent';
import { makeElement } from '@/util/dom';

import './MultiInput.scss';

export default class MultiInput extends UIComponent {
  public constructor(
    ...components: UIComponent[]
  ) {
    super(makeElement('div', { className: 'multi-input' }), ...components);
  }
}