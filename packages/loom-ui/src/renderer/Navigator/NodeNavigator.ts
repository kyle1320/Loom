import { Value } from 'loom-data';
import * as loom from 'loom-core';

import LoomUI, { DataTypes } from '@/LoomUI';
import { UIComponent } from '@/UIComponent';
import { IconButton } from '@/common';
import { makeElement, toggleClass, parseElement } from '@/util/dom';
import { showMenu } from '@/util/electron';
import { isValidChild } from '@/util/html';

import './NodeNavigator.scss';

type Node = loom.Element | loom.TextNode | loom.Component;

let drag: NodeNavigator | null = null;
const dropMarker: HTMLElement = parseElement('.drop-marker');

export default class NodeNavigator extends UIComponent<{}, HTMLElement> {
  private readonly childrenNav:
  ElementChildrenNavigator | ComponentChildrenNavigator | null;

  public constructor(
    ui: LoomUI,
    public readonly node: Node,
    depth = 0
  ) {
    super(makeElement('div', {
      className: 'node-nav__container',
      draggable: !!node.source.parent(),
      ondragstart: e => {
        e.stopPropagation();
        drag = this;
      },
      ondragend: () => {
        drag = null;
        dropMarker.remove();
      },
      ondragover: e => {
        if (drag && !drag.el.contains(this.el) &&
          node instanceof loom.Element && isValidChild(node, drag.node)) {
          e.stopPropagation();
          e.preventDefault();
          e.dataTransfer!.dropEffect = 'move';
          drag && this.drop(e.clientX, e.clientY);
          toggleClass(this.el, 'dropping', true);
        }
      },
      ondragleave: e => {
        if (node instanceof loom.Element) {
          e.stopPropagation();
          e.preventDefault();
          dropMarker.remove();
        }
      },
      ondrop: e => {
        if (drag && !drag.el.contains(this.el) &&
          node instanceof loom.Element && isValidChild(node, drag.node)) {
          e.stopPropagation();
          e.preventDefault();
          drag && this.drop(e.clientX, e.clientY, drag.node);
        }
      }
    }));

    if (node instanceof loom.Element) {
      this.appendChild(new ElementNavigator(ui, node, depth));
      this.appendChild(
        this.childrenNav = new ElementChildrenNavigator(ui, node, depth));
    } else if (node instanceof loom.TextNode) {
      this.appendChild(new TextNodeNavigator(ui, node, depth));
      this.childrenNav = null;
    } else if (node instanceof loom.Component) {
      this.el.className += ' node-nav__container--component'
      this.appendChild(new ComponentNavigator(ui, node, depth));
      this.appendChild(
        this.childrenNav = new ComponentChildrenNavigator(ui, node, depth));
    } else {
      this.childrenNav = null;
    }
  }

  public drop(x: number, y: number, node: Node | null = null): void {
    this.childrenNav && this.childrenNav.drop(x, y, node);
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
    title: Value<string>,
    depth = 0
  ) {
    super(makeElement('div', {
      className: 'node-nav node-nav__' + type,
      style: { paddingLeft: (depth*10) + 'px' },
      onclick: e => {
        e.stopPropagation();
        ui.data.set(node);
      },
      oncontextmenu: e => {
        e.stopPropagation();
        const menu = node instanceof loom.Element ? ui.getAddMenu(node) : [];
        if (node instanceof loom.Element && node.source.parent()) menu.push({
          type: 'separator'
        }, {
          label: 'Make Component',
          click: () => ui.prompt.show(
            'Enter a name for the new component',
            name => {
              if (!name) return 'Please enter a value';
              if (ui.sources.components.has(name)) {
                return 'A component with this name already exists. '
                + 'Please choose another name.';
              } else {
                ui.sources.components.set(name, node.source);
                node.source.replace(new loom.ComponentDef(name));
              }
              return void 0;
            }
          )
        });
        if (node.source.parent()) menu.push({
          type: 'separator'
        }, {
          label: 'Delete',
          click: () => node.source.delete()
        });
        showMenu(menu);
      }
    }));

    this.iconEl = makeElement('i', { className: this.getIcon() });
    this.el.appendChild(this.iconEl);
    this.titleEl =
      makeElement('div', { className: 'node-nav__title' }, title.get());
    this.el.appendChild(this.titleEl);
    this.el.appendChild(parseElement('.sep'));

    this.appendChild(new IconButton('fa fa-trash', {
      disabled: !node.source.parent()
    }).on('click', () => node.source.delete()));
    const addMenu = node instanceof loom.Element ? ui.getAddMenu(node) : [];
    this.appendChild(new IconButton('fa fa-plus', {
      disabled: !addMenu.some(x => x.enabled ?? true)
    }).on('click', () => showMenu(addMenu)));

    this.destroy.do(
      ui.data.watch(this.updateSelected),
      title.onOff('change', this.update)
    );
  }

  private updateSelected = (data: DataTypes | null): void => {
    toggleClass(this.el, 'selected', data === this.node);
  }

  protected update = (title: string): void => {
    this.titleEl.textContent = title;
    this.iconEl.className = this.getIcon();
  }

  protected abstract getIcon(): string;
}

class TextNodeNavigator extends SingleNodeNavigator<loom.TextNode> {
  public constructor(
    ui: LoomUI,
    node: loom.TextNode,
    depth = 0
  ) {
    super(ui, node, 'text', node.content, depth);
  }

  protected getIcon(): string {
    return 'fa fa-quote-right';
  }
}

class ElementNavigator extends SingleNodeNavigator<loom.Element> {
  public constructor(
    ui: LoomUI,
    node: loom.Element,
    depth = 0
  ) {
    super(ui, node, 'element', node.tag, depth);
  }

  protected getIcon(): string {
    switch (this.node.tag.get()) {
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
}

class ElementChildrenNavigator extends UIComponent {
  public constructor(
    ui: LoomUI,
    private readonly node: loom.Element,
    depth = 0
  ) {
    super(makeElement('div', { className: 'node-nav__children' }));

    this.destroy.do(node.children.watch(
      (index, value) =>
        this.insertChild(new NodeNavigator(ui, value, depth + 1), index),
      index => this.removeChild(index)
    ));
  }

  public drop(x: number, y: number, node: Node | null = null): void {
    const children = this.children as NodeNavigator[];
    let i = 0;
    for (; i < children.length; i++) {
      const rect = children[i].getEl().getBoundingClientRect();
      console.log(y, rect.top, rect.bottom);
      if ((rect.top + rect.bottom) / 2 > y) break;
    }
    if (node) {
      const existingIndex = this.node.children.asArray().indexOf(node);
      node.source.delete();
      this.node.children.source.add(
        node.source,
        existingIndex >= 0 && existingIndex < i ? i - 1 : i
      );
    } else {
      dropMarker.remove();
      this.el.insertBefore(dropMarker, children[i]?.getEl());
    }
  }
}

class ComponentNavigator extends SingleNodeNavigator<loom.Component> {
  public constructor(
    ui: LoomUI,
    node: loom.Component,
    depth = 0
  ) {
    super(ui, node, 'component', node.source.name, depth);
  }

  protected getIcon(): string {
    return this.node.element.get() instanceof loom.UnknownComponent
      ? 'fa fa-question' : 'fa fa-clone';
  }
}

class ComponentChildrenNavigator extends UIComponent {
  private rootNode: NodeNavigator | null = null;

  public constructor(
    ui: LoomUI,
    node: loom.Component,
    depth = 0
  ) {
    super(makeElement('div', { className: 'node-nav__children' }));

    this.destroy.do(node.element.watch(el => {
      this.empty();
      if (!(el instanceof loom.UnknownComponent)) {
        this.insertChild(this.rootNode = new NodeNavigator(ui, el, depth + 1));
      } else {
        this.rootNode = null;
      }
    }));
  }

  public drop(x: number, y: number, node: Node | null = null): void {
    this.rootNode && this.rootNode.drop(x, y, node);
  }
}