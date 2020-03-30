import { MenuItemConstructorOptions } from 'electron';
import * as loom from 'loom-core';

import NodeNavigator from './NodeNavigator';
import LoomUI from '@/LoomUI';
import { UIComponent } from '@/UIComponent';
import { IconButton } from '@/common';
import { makeElement } from '@/util/dom';
import { showMenu } from '@/util/electron';
import { validChildren, isValidChild, supportsText } from '@/util/html';
import C from '@/util/constants';

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
        showMenu(getAddMenu(ui, el));
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

export function getAddMenu(
  ui: LoomUI,
  el: loom.Element
): MenuItemConstructorOptions[] {
  const res: MenuItemConstructorOptions[] = [];
  const components = [...el.sources.components.keys()].filter(name => {
    return isValidChild(el, el.sources.components.get(name)!);
  });
  const elements: MenuItemConstructorOptions[] =
    (validChildren(el) || C.html.basicTags)
      .map(tag => ({
        label: tag,
        click: () => ui.data.set(
          el.children.addThrough(new loom.ElementDef(tag))
        )
      }));

  if (supportsText(el)) {
    elements.unshift({
      label: 'text',
      click: () => ui.data.set(
        el.children.addThrough(new loom.TextNodeDef('text'))
      )
    }, {
      type: 'separator'
    });
  }

  res.push({
    label: 'New Element',
    submenu: elements,
    enabled: elements.length > 0
  }, {
    label: 'Add Component',
    submenu: components.map(name => ({
      label: name,
      click: () => ui.data.set(
        el.children.addThrough(new loom.ComponentDef(name))
      )
    })),
    enabled: components.length > 0
  });

  if (el.tag.get() === 'head') {
    res.push({
      label: 'Add Title',
      click: () => ui.data.set(
        el.children.addThrough(new loom.ElementDef('title', {}, [
          new loom.TextNodeDef('title')
        ]))
      )
    })
  }

  return res;
}