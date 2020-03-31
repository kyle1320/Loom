import Button from './Button';
import { UIComponent } from '@/UIComponent';
import { makeElement, toggleClass } from '@/util/dom';

import './Prompt.scss';

class PromptContents extends UIComponent<{}, HTMLElement> {
  private title: HTMLElement;
  private input: HTMLInputElement;
  private error: HTMLElement;

  private callback: ((value?: string) => string | void) | null = null;

  public constructor(container: Prompt) {
    super(makeElement('div', {
      className: 'prompt',
      onclick: e => e.stopPropagation()
    }));

    this.el.appendChild(
      this.title = makeElement('div', { className: 'prompt__title' }));
    this.el.appendChild(
      this.error = makeElement('div', { className: 'prompt__error' }));
    this.el.appendChild(this.input = makeElement('input', {
      onkeydown: e => e.keyCode === 13 && submit()
    }));
    const submit = (): void => {
      toggleClass(this.el, 'error', false);
      const err = this.callback?.(this.input.value);
      if (err) {
        this.error.textContent = err;
        toggleClass(this.el, 'error', true);
      } else {
        container.hide();
      }
    };
    this.appendChild(new UIComponent(
      makeElement('div', { className: 'prompt__controls' }),
      new Button('Cancel').on('click', () => {
        this.callback?.();
        container.hide();
      }),
      new Button('Ok', 'primary').on('click', submit))
    );
  }

  public hide(): void {
    toggleClass(this.el, 'error', false);
    this.callback = null;
    this.input.value = '';
  }

  public show(title: string, cb: (value?: string) => string | void): void {
    this.title.textContent = title;
    this.callback = cb;
    this.input.focus();
  }
}

export default class Prompt extends UIComponent<{}, HTMLElement> {
  private readonly contents: PromptContents;

  public constructor() {
    super(makeElement('div', {
      className: 'prompt__container',
      onclick: () => this.hide()
    }));

    this.appendChild(this.contents = new PromptContents(this));
  }

  public hide(): void {
    this.contents.hide();
    toggleClass(this.el, 'show', false);
  }

  public show(title: string, cb: (value?: string) => string | void): void {
    toggleClass(this.el, 'show', true);
    this.contents.show(title, cb);
  }
}