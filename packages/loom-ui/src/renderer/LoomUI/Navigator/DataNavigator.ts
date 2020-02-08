import * as loom from 'loom-core';

import NodeNavigator from './NodeNavigator';
import LoomUI from '..';
import { makeElement } from '../util/dom';
import { UIComponent } from '../UIComponent';

import './DataNavigator.scss';

export default class DataNavigator extends UIComponent {
  public constructor(ui: LoomUI) {
    super(makeElement('div', { className: 'data-nav' }));

    this.listen(ui, 'updateContent', content => {
      this.empty();

      if (content instanceof loom.Element) {
        this.appendChild(new NodeNavigator(ui, content));
      } else if (content instanceof loom.Page) {
        this.appendChild(new NodeNavigator(ui, content.head));
        this.appendChild(new NodeNavigator(ui, content.body));
      }
    });
  }
}