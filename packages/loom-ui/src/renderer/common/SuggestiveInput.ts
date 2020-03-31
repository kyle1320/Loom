import { Value, WritableValue } from 'loom-data';
import * as Fuse from 'fuse.js';

import { makeElement, toggleClass } from '@/util/dom';
import { UIComponent } from '@/UIComponent';
import Button from './Button';

import './SuggestiveInput.scss';

interface FuseMatch {
  indices: [number, number][];
  value: string;
  key: string;
}
function highlight(
  value: string,
  key: string,
  matches: FuseMatch[]
): HTMLElement {
  const indices: [number, number][] = [];
  matches.forEach(
    m => m.key === key && m.indices.forEach(i => indices.push(i))
  );
  const el = makeElement('div');
  el.className = 'highlight';
  let i = 0;
  for (const arr of indices.sort((a, b) => a[0] - b[0] || b[1] - a[1])) {
    let a = arr[0];
    const b = arr[1];
    if (b < i) continue;
    if (a < i) a = i;
    if (i < a) el.appendChild(document.createTextNode(value.substring(i, a)));
    el.appendChild(makeElement('span', {}, value.substring(a, b + 1)));
    i = b + 1;
  }
  if (i < value.length) {
    el.appendChild(document.createTextNode(value.substring(i)));
  }
  return el;
}

class Suggestion extends UIComponent<{ select: void }, HTMLElement> {
  public constructor(
    result: Fuse.FuseResultWithMatches<SuggestiveInput.SuggestionValue>
  ) {
    super(makeElement('div', {
      className: 'suggestion',
      tabIndex: 0,
      onclick: () => this.emit('select'),
      onkeydown: e => e.keyCode === 13 && this.emit('select')
    }, highlight(result.item.value, 'value', result.matches)));

    const details = makeElement('div', { className: 'suggestion__details' });
    details.innerHTML = result.item.details || '';
    this.el.appendChild(details);
  }
}

class Suggestions extends UIComponent<{ select: string }, HTMLElement> {
  private selected: HTMLElement | null = null;

  public constructor(
    suggestions: SuggestiveInput.SuggestionValue[],
    search: Value<string>
  ) {
    super(makeElement('div', { className: 'suggestive-input__suggestions' }));

    const fuse = new Fuse(suggestions, {
      includeMatches: true,
      threshold: 0.3,
      keys: [{
        name: 'value',
        weight: 0.6
      }, {
        name: 'keywords',
        weight: 0.4
      }]
    });

    this.destroy.do(search.watch(val => {
      this.empty();
      if (val) {
        fuse.search(val).forEach(
          result => this.appendChild(new Suggestion(result)
            .on('select', () => this.emit('select', result.item.value)))
        );
        this.setSelected(this.el.firstElementChild as HTMLElement);
      }
    }));
  }

  public select(): void {
    if (this.selected) this.selected.click();
  }

  public up(): void {
    this.setSelected(this.selected &&
      this.selected.previousElementSibling as HTMLElement);
  }

  public down(): void {
    this.setSelected(this.selected
      ? this.selected.nextElementSibling as HTMLElement
      : this.el.firstElementChild as HTMLElement);
  }

  private setSelected(el: HTMLElement | null): void {
    if (el === this.selected) return;

    if (this.selected) {
      toggleClass(this.selected, 'highlight', false);
    }
    this.selected = el;
    if (this.selected) {
      this.selected.scrollIntoView({ block: 'nearest' });
      toggleClass(this.selected, 'highlight', true);
    }
  }
}

namespace SuggestiveInput {
  export interface SuggestionValue {
    value: string;
    details?: string;
    keywords?: string;
  }
}

class SuggestiveInput extends UIComponent<{
  submit: string;
}> {
  public constructor(
    suggestions: SuggestiveInput.SuggestionValue[],
    placeholder?: string,
    submitText?: string
  ) {
    const value = new WritableValue('');
    const submit = (val = value.get()): void => {
      val && this.emit('submit', val);
      value.set('');
    };

    const suggestionsComp = new Suggestions(suggestions, value)
      .on('select', submit);
    const input: HTMLInputElement = makeElement('input', {
      value: value.get(),
      placeholder,
      oninput: () => value.set(input.value),
      onkeydown: e => {
        switch (e.keyCode) {
          case 13: suggestionsComp.select(); break; // enter
          case 38: suggestionsComp.up(); break;     // up arrow
          case 40: suggestionsComp.down(); break;   // down arrow
        }
      }
    });
    const btn = new Button(submitText || 'Submit', 'primary', 'small')
      .on('click', () => submit())
    super(
      makeElement('div', { className: 'suggestive-input multi-input' }),
      new UIComponent(input),
      suggestionsComp,
      btn,
    );

    this.destroy.do(value.watch(val => {
      input.value = val;
      btn.disable(!val);
    }));
  }
}

export default SuggestiveInput;