import { UIComponent } from '@/UIComponent';
import { makeElement } from '@/util/dom';
import HelpIcon from '@/common/HelpIcon';

export default class PropertyField extends UIComponent<{}, HTMLElement> {
  private readonly help: HelpIcon;

  public constructor(
    title: string,
    input: UIComponent,
    helpText: string | (() => string | Promise<string>),
    key?: string
  ) {
    super(makeElement('label', { className: 'property-field' }));
    this.help = new HelpIcon(helpText);
    const titleEl = new UIComponent(makeElement(
      'div', { className: 'property-field__title' }, title
    ), this.help);
    if (key) titleEl.getEl().title = key;
    this.el.dataset.key = key;
    this.appendChild(titleEl);
    this.appendChild(input);
  }
}