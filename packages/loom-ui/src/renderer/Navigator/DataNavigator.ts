import * as loom from 'loom-core';

import NodeNavigator from './NodeNavigator';
import LoomUI from '@/LoomUI';
import { UIComponent } from '@/UIComponent';
import { IconButton } from '@/common';
import { makeElement } from '@/util/dom';
import { showMenu } from '@/util/electron';

import './DataNavigator.scss';

class DataNavigatorHeader extends UIComponent<{ back: void }> {
  private locationEl: HTMLElement;

  public constructor(ui: LoomUI) {
    super(makeElement('div', { className: 'data-nav__header' }),
      new IconButton('fa fa-arrow-left').on('click', () => this.emit('back')));

    this.appendChild(new UIComponent(
      this.locationEl = makeElement('div', { className: 'data-nav__location' })
    ));

    let cleanup: (() => void) | null = null;
    this.destroy.do(ui.contentDef.watch(row => {
      cleanup && cleanup();
      cleanup = row && row.key.watch(this.setTitle.bind(this, row.value.get()));
    }), () => cleanup && cleanup());
  }

  private setTitle = (
    value: loom.PageDef | loom.ElementDef | undefined,
    key: string
  ): void => {
    if (value instanceof loom.ElementDef) {
      this.locationEl.textContent = 'Component: ' + key;
    } else {
      this.locationEl.textContent = 'Page: ' + key;
    }
  }
}

class DataNavigatorContent extends UIComponent {
  public constructor(ui: LoomUI) {
    super(makeElement('div', {
      className: 'data-nav__content',
      oncontextmenu: e => {
        e.stopPropagation();
        const content = ui.content.get()!;
        const el = content instanceof loom.Element ? content : content.body;
        showMenu(ui.getAddMenu(el));
      }
    }));

    this.destroy.do(ui.content.watch(content => {
      this.empty();

      if (content instanceof loom.Element) {
        this.appendChild(new NodeNavigator(ui, content));
      } else if (content instanceof loom.Page) {
        this.appendChild(new NodeNavigator(ui, content.head));
        this.appendChild(new NodeNavigator(ui, content.body));
      }
    }));
  }
}

export default class DataNavigator extends UIComponent<{ back: void }> {
  public constructor(ui: LoomUI) {
    super(makeElement('div', {
      className: 'data-nav',
      onclick: () => ui.data.set(null)
    }),
    new DataNavigatorHeader(ui).on('back', () => this.emit('back')),
    new DataNavigatorContent(ui));
  }
}