import { UIComponent } from '@/UIComponent';
import { makeElement } from '@/util/dom';

export default class PropertyField extends UIComponent {
  public constructor(title: string, input: UIComponent) {
    super(makeElement('label', { className: 'property-field' },
      makeElement('div', { className: 'property-field__title' }, title)),
    input);
  }
}