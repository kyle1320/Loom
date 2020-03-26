import { Value } from 'loom-data';
import * as loom from 'loom-core';

import LoomUI, { DataTypes } from '@/LoomUI';
import { UIComponent } from '@/UIComponent';
import { makeElement, toggleClass } from '@/util/dom';
import { showMenu } from '@/util/electron';
import { validChildren, isEmptyElement, isValidChild } from '@/util/html';
import C from '@/util/constants';

import './NodeNavigator.scss';

type Node = loom.Element | loom.TextNode | loom.Component;

export default class NodeNavigator extends UIComponent<{}, HTMLElement> {
  public constructor(
    ui: LoomUI,
    node: Node,
    depth = 0
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
        const components = node instanceof loom.Element
          ? [...ui.sources.components.keys()].filter(name => {
            return isValidChild(node, ui.sources.components.get(name)!);
          })
          : [];
        showMenu([
          ...(node instanceof loom.Element && !isEmptyElement(node) ? [{
            label: 'New Element',
            submenu: [{
              label: 'text',
              click: () => ui.data.set(
                node.children.addThrough(new loom.TextNodeDef('text'))
              )
            }, {
              type: 'separator'
            } as const, ...(validChildren(node.source) || C.html.basicTags)
              .map(tag => ({
                label: tag,
                click: () => ui.data.set(
                  node.children.addThrough(new loom.ElementDef(tag))
                )
              }))]
          }, {
            label: 'Add Component',
            submenu: components.map(name => ({
              label: name,
              click: () => ui.data.set(
                node.children.addThrough(new loom.ComponentDef(name))
              )
            })),
            enabled: components.length > 0
          }] : []),
          ...(node instanceof loom.HeadElement ? [{
            label: 'Add Title',
            click: () => ui.data.set(
              node.children.addThrough(new loom.ElementDef('title', {}, [
                new loom.TextNodeDef('title')
              ]))
            )
          }] : []),
          ...(node.source.parent() ? [{
            label: 'Delete',
            click: () => node.source.delete()
          }] : [])
        ]);
      }
    }));

    this.iconEl = makeElement('i', { className: this.getIcon() });
    this.el.appendChild(this.iconEl);
    this.titleEl =
      makeElement('div', { className: 'node-nav__title' }, title.get());
    this.el.appendChild(this.titleEl);

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
    node: loom.Element,
    depth = 0
  ) {
    super(makeElement('div', { className: 'node-nav__children' }));

    this.destroy.do(node.children.watch(
      (index, value) =>
        this.insertChild(new NodeNavigator(ui, value, depth + 1), index),
      index => this.removeChild(index)
    ));
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
  public constructor(
    ui: LoomUI,
    node: loom.Component,
    depth = 0
  ) {
    super(makeElement('div', { className: 'node-nav__children' }));

    this.destroy.do(node.element.watch(el => {
      this.empty();
      if (!(el instanceof loom.UnknownComponent)) {
        this.insertChild(new NodeNavigator(ui, el, depth + 1));
      }
    }));
  }
}