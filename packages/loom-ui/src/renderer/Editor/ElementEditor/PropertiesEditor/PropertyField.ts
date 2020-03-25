import { UIComponent, UIContainer } from '@/UIComponent';
import { makeElement } from '@/util/dom';
import HelpIcon from '@/common/HelpIcon';

export default class PropertyField extends UIComponent<{}, HTMLElement> {
  public constructor(
    title: string,
    input: UIComponent,
    helpText?: string | (() => string | Promise<string>),
    key?: string
  ) {
    super(makeElement('label', { className: 'property-field' }));

    const titleEl = new UIContainer('property-field__title');
    titleEl.appendChild(new UIComponent(makeElement('span', {}, title)));
    if (helpText) titleEl.appendChild(new HelpIcon(helpText));

    if (key) titleEl.getEl().title = key;
    this.el.dataset.key = key;

    this.appendChild(titleEl);
    this.appendChild(input);
  }
}