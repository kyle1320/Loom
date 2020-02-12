import * as loom from 'loom-core';

import LoomUI, { DataTypes } from '..';
import { UIComponent } from '../UIComponent';
import { makeElement, toggleClass } from '../util/dom';

import './NodeNavigator.scss';

type Node = loom.Element | loom.TextNode | loom.Component;

export default class NodeNavigator extends UIComponent {
  public constructor(
    ui: LoomUI,
    node: Node,
    depth = 1
  ) {
    super(makeElement('div', { className: 'node-nav__container' }));

    if (node instanceof loom.Element) {
      this.appendChild(new ElementNavigator(ui, node, depth));
      this.appendChild(new ElementChildrenNavigator(ui, node, depth));
    } else if (node instanceof loom.TextNode) {
      this.appendChild(new TextNodeNavigator(ui, node, depth));
    } else if (node instanceof loom.Component) {
      this.appendChild(new ComponentNavigator(ui, node, depth));
      this.appendChild(new ComponentChildrenNavigator(ui, node, depth));
    }
  }
}

class SingleNodeNavigator extends UIComponent<{}, HTMLElement> {
  public constructor(
    ui: LoomUI,
    private readonly node: Node,
    type: string,
    title: string,
    depth = 1
  ) {
    super(makeElement('div', {
      className: 'node-nav node-nav__' + type,
      style: { paddingLeft: (depth*10) + 'px' },
      onclick: () => ui.selectData(node)
    }, title));

    ui.on('updateData', this.updateSelected)
    this.updateSelected(ui.getSelectedData());
  }

  private updateSelected = (data: DataTypes | null): void => {
    toggleClass(this.el, 'selected', data === this.node);
  }
}

class TextNodeNavigator extends SingleNodeNavigator {
  public constructor(
    ui: LoomUI,
    node: loom.TextNode,
    depth = 1
  ) {
    super(ui, node, 'text', node.content, depth);

    this.listen(node, 'contentChanged', val => this.el.textContent = val);
  }
}

class ElementNavigator extends SingleNodeNavigator {
  public constructor(
    ui: LoomUI,
    node: loom.Element,
    depth = 1
  ) {
    super(ui, node, 'element', node.tag, depth);

    this.listen(node, 'tagChanged', val => this.el.textContent = val);
  }
}

class ElementChildrenNavigator extends UIComponent {
  public constructor(
    ui: LoomUI,
    node: loom.Element,
    depth = 1
  ) {
    super(makeElement('div', { className: 'node-nav__children' }));

    for (const child of node.children.raw()) {
      this.insertChild(new NodeNavigator(ui, child, depth + 1));
    }

    this.listen(node.children, 'addRaw', ({ index, value }) =>
      this.insertChild(new NodeNavigator(ui, value, depth + 1), index));
    this.listen(node.children, 'remove',
      index => this.removeChild(index));
  }
}

class ComponentNavigator extends SingleNodeNavigator {
  public constructor(
    ui: LoomUI,
    node: loom.Component,
    depth = 1
  ) {
    super(ui, node, 'element', node.source.name, depth);

    this.listen(node.source, 'nameChanged', val => this.el.textContent = val);
  }
}

class ComponentChildrenNavigator extends UIComponent {
  public constructor(
    ui: LoomUI,
    node: loom.Component,
    depth = 1
  ) {
    super(makeElement('div', { className: 'node-nav__children' }));

    if (!(node.element instanceof loom.EmptyComponent)) {
      this.insertChild(new NodeNavigator(ui, node.element, depth + 1));
    }

    this.listen(node, 'elementChanged', el => {
      this.empty();
      if (!(el instanceof loom.EmptyComponent)) {
        this.insertChild(new NodeNavigator(ui, el, depth + 1));
      }
    });
  }
}