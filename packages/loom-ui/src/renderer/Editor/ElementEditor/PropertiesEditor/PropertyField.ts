import { UIComponent } from '@/UIComponent';
import { makeElement } from '@/util/dom';

export default class PropertyField extends UIComponent {
  public constructor(title: string, input: UIComponent, hover?: string) {
    super(makeElement('label', { className: 'property-field' }));
    const titleEl = makeElement(
      'div', { className: 'property-field__title' }, title
    );
    if (hover) titleEl.title = hover;
    this.el.appendChild(titleEl);
    this.appendChild(input);
  }
}