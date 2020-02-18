import * as loom from 'loom-core';

import NodeNavigator from './NodeNavigator';
import LoomUI from '..';
import { makeElement } from '../util/dom';
import { UIComponent } from '../UIComponent';
import IconButton from '../common/IconButton';

import './DataNavigator.scss';

class DataNavigatorHeader extends UIComponent<{ back: void }> {
  public constructor() {
    super(makeElement('div', { className: 'data-nav__header' }),
      new IconButton('fa fa-arrow-left').on('click', () => this.emit('back')));
  }
}

class DataNavigatorContent extends UIComponent {
  public constructor(ui: LoomUI) {
    super(makeElement('div', { className: 'data-nav__content' }));

    this.autoCleanup(ui.content.watch(content => {
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
    super(makeElement('div', { className: 'data-nav' }),
      new DataNavigatorHeader().on('back', () => this.emit('back')),
      new DataNavigatorContent(ui));
  }
}