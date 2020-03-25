import IconButton from './IconButton';
import { UIComponent } from '@/UIComponent';
import { makeElement } from '@/util/dom';

import './HelpIcon.scss';

class HelpIconTooltip extends UIComponent<{}, HTMLElement> {
  public constructor(
    private html: string | (() => string | Promise<string>)
  ) {
    super(makeElement('div', {
      className: 'help-icon__tooltip help-icon__tooltip--left'
    }));
    this.el.innerHTML = (typeof html === 'function') ? 'Loading...' : html;
  }

  public async load(): Promise<void> {
    if (typeof this.html === 'function') {
      this.html = await this.html();
      this.el.innerHTML = this.html;
    }
  }
}

export default class HelpIcon extends UIComponent<{}, HTMLElement> {
  public constructor(html: string | (() => string | Promise<string>)) {
    super(makeElement('div', { className: 'help-icon' }));

    const tooltip = new HelpIconTooltip(html);
    this.appendChild(tooltip);
    this.appendChild(new IconButton('fa fa-question-circle')
      .on('focus', () => tooltip.load()));
  }
}