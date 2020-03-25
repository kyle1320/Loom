import { UIComponent, UIContainer } from '@/UIComponent';
import { makeElement } from '@/util/dom';
import HelpIcon from '@/common/HelpIcon';

export default class PropertyField extends UIComponent<{
  delete: void;
}, HTMLElement> {
  public constructor(
    title: string,
    input: UIComponent,
    options: {
      helpText?: string | (() => string | Promise<string>);
      key?: string;
      canDelete?: boolean;
    } = {}
  ) {
    super(makeElement('label', { className: 'property-field' }));

    const titleEl = new UIContainer('property-field__title');
    titleEl.appendChild(new UIComponent(makeElement('span', {
      className: options.canDelete ? 'can-delete' : '',
      onclick: e => {
        e.preventDefault();
        e.stopPropagation();
        options.canDelete && this.emit('delete');
      }
    }, title)));

    if (options.helpText) titleEl.appendChild(new HelpIcon(options.helpText));

    this.el.dataset.key = options.key;

    this.appendChild(titleEl);
    this.appendChild(input);
  }
}