import * as loom from 'loom-core';

import LoomUI, { DataTypes } from '..';
import { UIComponent } from '../UIComponent';
import { makeElement, toggleClass } from '../util/dom';

import './NodeNavigator.scss';

type Node = loom.Element | loom.TextNode | loom.Component;

export default class NodeNavigator extends UIComponent<{}, HTMLElement> {
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
      this.el.className += ' node-nav__container--component'
      this.appendChild(new ComponentNavigator(ui, node, depth));
      this.appendChild(new ComponentChildrenNavigator(ui, node, depth));
    }
  }
}

abstract class SingleNodeNavigator<N extends Node = Node>
  extends UIComponent<{}, HTMLElement> {

  private readonly iconEl: HTMLElement;
  private readonly titleEl: HTMLElement;

  public constructor(
    ui: LoomUI,
    protected readonly node: N,
    type: string,
    title: string,
    depth = 1
  ) {
    super(makeElement('div', {
      className: 'node-nav node-nav__' + type,
      style: { paddingLeft: (depth*10 + 15) + 'px' },
      onclick: () => ui.selectData(node)
    }));

    this.iconEl = makeElement('i', { className: this.getIcon() });
    this.el.appendChild(this.iconEl);
    this.titleEl = makeElement('div', { className: 'node-nav__title' }, title);
    this.el.appendChild(this.titleEl);

    ui.on('updateData', this.updateSelected)
    this.updateSelected(ui.getSelectedData());
  }

  private updateSelected = (data: DataTypes | null): void => {
    toggleClass(this.el, 'selected', data === this.node);
  }

  protected setTitle = (title: string): void => {
    this.titleEl.textContent = title;
  }

  protected abstract getIcon(): string;

  protected setIcon(icon: string | null = null): void {
    this.iconEl.className = icon || this.getIcon();
  }
}

class TextNodeNavigator extends SingleNodeNavigator<loom.TextNode> {
  public constructor(
    ui: LoomUI,
    node: loom.TextNode,
    depth = 1
  ) {
    super(ui, node, 'text', node.content, depth);

    this.listen(node, 'contentChanged', this.setTitle);
  }

  protected getIcon(): string {
    return 'fa fa-quote-right';
  }
}

class ElementNavigator extends SingleNodeNavigator<loom.Element> {
  public constructor(
    ui: LoomUI,
    node: loom.Element,
    depth = 1
  ) {
    super(ui, node, 'element', node.tag, depth);

    this.listen(node, 'tagChanged', this.tagChanged);
  }

  protected getIcon(): string {
    switch (this.node.tag) {
      case '': return 'fa fa-exclamation-triangle';
      case 'a': return 'fa fa-link';
      case 'b': return 'fa fa-bold';
      case 'i': return 'fa fa-italic';
      case 's': return 'fa fa-strikethrough';
      case 'p': return 'fa fa-paragraph';
      case 'u': return 'fa fa-underline';
      case 'h1':
      case 'h2':
      case 'h3':
      case 'h4':
      case 'h5':
      case 'h6': return 'fa fa-heading';
      case 'hr': return 'fa fa-horizontal-rule';
      case 'ol': return 'fa fa-list-ol';
      case 'ul': return 'fa fa-list-ul';
      case 'sub': return 'fa fa-subscript';
      case 'sup': return 'fa fa-superscript';
      case 'table': return 'fa fa-table';
    }
    return 'fa fa-code';
  }

  protected tagChanged = (tag: string): void => {
    this.setIcon();
    this.setTitle(tag);
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

class ComponentNavigator extends SingleNodeNavigator<loom.Component> {
  public constructor(
    ui: LoomUI,
    node: loom.Component,
    depth = 1
  ) {
    super(ui, node, 'component', node.source.name, depth);

    this.listen(node.source, 'nameChanged', this.nameChanged);
  }

  protected getIcon(): string {
    return this.node.element instanceof loom.EmptyComponent
      ? 'fa fa-question' : 'fa fa-clone';
  }

  protected nameChanged = (name: string): void => {
    this.setIcon();
    this.setTitle(name);
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