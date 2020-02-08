import * as loom from 'loom-core';

import LoomUI from '../../..';
import Floating from '../../../common/Floating';
import Frame from '../../../common/Frame';
import { makeElement } from '../../../util/dom';
import { UIComponent } from '../../../UIComponent';

import './WYSIWYGEditor.scss';

function makeComponent(
  ui: LoomUI,
  node: loom.Node,
  attach?: HTMLElement
): UIComponent {
  if (node instanceof loom.Element) {
    return new WYSIWYGElement(ui, node, attach);
  } else if (node instanceof loom.TextNode) {
    return new WYSIWYGTextNode(ui, node);
  } else {
    return new WYSIWYGUnknown(ui);
  }
}

class WYSIWYGElement extends UIComponent<{}, HTMLElement> {
  public constructor(
    private readonly ui: LoomUI,
    private readonly data: loom.Element,
    el?: HTMLElement
  ) {
    super();
    this.el = this.makeEl(el);

    for (const node of this.data.children) {
      const child = makeComponent(this.ui, node);
      this.appendChild(child);
    }

    this.listen(data, 'tagChanged', () => this.changeEl(this.makeEl()));

    this.listen(data.attrs, 'set',
      ({ key, value }) => this.el.setAttribute(key, value));
    this.listen(data.attrs, 'delete', (key) => this.el.removeAttribute(key));

    this.listen(data.children, 'add', ({ index, value }) =>
      this.insertChild(makeComponent(ui, value), index));
    this.listen(data.children, 'remove',
      index => this.removeChild(index));
    this.listen(data.children, 'update', ({ index, value }) =>
      this.setChild(makeComponent(ui, value), index));
  }

  private makeEl(el?: HTMLElement): HTMLElement {
    el = el || document.createElement(this.data.tag || 'div');

    for (const key of this.data.attrs.keys()) {
      el.setAttribute(key, this.data.attrs.get(key)!);
    }

    el.addEventListener('click', e => {
      e.stopPropagation();
      this.ui.selectData(this.data);
    });

    return el;
  }
}

class WYSIWYGTextNode extends UIComponent {
  public constructor(
    ui: LoomUI,
    data: loom.TextNode
  ) {
    super(document.createTextNode(data.content));
    this.listen(data, 'contentChanged',
      content => this.el.textContent = content);
  }
}

class WYSIWYGUnknown extends UIComponent {
  public constructor(ui: LoomUI) {
    super(document.createComment('Unknown Component'));
  }
}

export default class WYSIWYGEditor extends UIComponent {
  public constructor(ui: LoomUI) {
    super(makeElement('div', { className: 'wysiwyg-editor' }),
      new Floating(new Frame((doc: Document) => {
        const content = ui.getSelectedContent() as loom.Page | loom.Element;
        let head: UIComponent | null = null;
        let body: UIComponent | null = null;

        if (content instanceof loom.Page) {
          head = makeComponent(ui, content.head, doc.head);
          body = makeComponent(ui, content.body, doc.body);
        } else {
          body = makeComponent(ui, content);
          body.addTo(doc.body);
        }

        return () => {
          if (head) head.destroy();
          if (body) body.destroy();
        };
      })));
  }
}