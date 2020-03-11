import * as loom from 'loom-core';

import EditFrame from './EditFrame';
import LoomUI, { DataTypes } from '@/LoomUI';
import { UIComponent } from '@/UIComponent';
import { Floating, Frame } from '@/common';
import { addStyles } from '@/util/css';
import { makeElement } from '@/util/dom';

import './WYSIWYGEditor.scss';

function makeNodeDef(node: Node): loom.ElementDef | loom.TextNodeDef | null {
  switch (node.nodeType) {
    case 1: // Element
      return new loom.ElementDef(
        node.nodeName.toLowerCase(),
        makeAttributes((node as Element).attributes),
        [] // children should be added by other mutation records
      )
    case 3: // Text
      return new loom.TextNodeDef(node.nodeValue || '');
    default:
      console.warn('Unknown node ', node);
      return null;
  }
}

function makeAttributes(attrs: NamedNodeMap): loom.AttributesDef {
  const data: Record<string, string> = {};

  for (let i = 0; i < attrs.length; i++) {
    const item = attrs.item(i)!;
    data[item.name] = item.value;
  }

  return new loom.AttributesDef(data);
}

function makeComponent(
  editor: WYSIWYGEditor,
  node: loom.Node | loom.UnknownComponent,
  attach?: Node
): WYSIWYGNode {
  if (node instanceof loom.Element) {
    return new WYSIWYGElement(editor, node, attach as HTMLElement);
  } else if (node instanceof loom.TextNode) {
    return new WYSIWYGTextNode(editor, node, attach as Text);
  } else if (node instanceof loom.Component) {
    return new WYSIWYGComponent(editor, node);
  } else {
    return new WYSIWYGUnknown(editor);
  }
}

export type WYSIWYGNode
  = WYSIWYGElement
  | WYSIWYGTextNode
  | WYSIWYGComponent
  | WYSIWYGUnknown;

export class WYSIWYGElement extends UIComponent<{}, HTMLElement> {
  private ignoreEvents = false;

  public constructor(
    private readonly editor: WYSIWYGEditor,
    public readonly data: loom.Element,
    el?: HTMLElement
  ) {
    super();
    this.el = this.makeEl(el);

    this.autoCleanup(
      data.tag.onOff('change', () => {
        editor.removeNode(this);
        this.changeEl(this.makeEl());
        editor.addNode(this);
      }),
      data.attrs.watch({
        set: (key, value) => this.el.setAttribute(key, value),
        delete: key => this.el.removeAttribute(key)
      }),
      data.children.watch(
        (index, value) => !this.ignoreEvents &&
          this.insertChild(makeComponent(editor, value), index),
        index => !this.ignoreEvents && this.removeChild(index)
      )
    );

    editor.addNode(this);
  }

  public makeAndInsertBefore(
    node: Node,
    comp: WYSIWYGNode | null
  ): WYSIWYGNode | null {
    const def = makeNodeDef(node)
    let res: WYSIWYGNode | null = null;
    if (!def) return null;
    this.ignoreEvents = true;
    if (comp) {
      const el = comp.data && this.data.children.addDefBefore(def, comp.data);

      // **********
      // With designMode on, nodes get created by the browser.
      // We want to link them up with the components that get created.
      // To do this, we have to create the component at this level,
      // instead of in the event listener.
      // **********
      if (el) {
        res = makeComponent(this.editor, el, node);
        this.insertBefore(res, comp, false);
      }
    } else {
      const el = this.data.children.addDef(def);
      res = makeComponent(this.editor, el, node)
      this.appendChild(res, false);
    }
    this.ignoreEvents = false;
    return res;
  }

  public deleteChild(comp: WYSIWYGNode): void {
    comp.data && this.data.source.children.remove(comp.data.source);
  }

  public destroy(): void {
    this.editor.removeNode(this);
    super.destroy();
  }

  private makeEl(el?: HTMLElement): HTMLElement {
    el = el || document.createElement(this.data.tag.get() || 'div');

    for (const key of this.data.attrs.keys()) {
      el.setAttribute(key, this.data.attrs.get(key)!);
    }

    el.addEventListener('mousedown', e => {
      e.stopPropagation();
      this.editor.select(this);
    });

    return el;
  }
}

export class WYSIWYGTextNode extends UIComponent {
  public constructor(
    private readonly editor: WYSIWYGEditor,
    public readonly data: loom.TextNode,
    el?: Text
  ) {
    super(el || document.createTextNode(data.content.get()));

    this.autoCleanup(data.content.onOff('change', content => {
      if (content !== this.el.textContent) this.el.textContent = content;
    }));

    editor.addNode(this);
  }

  public destroy(): void {
    this.editor.removeNode(this);
    super.destroy();
  }
}

export class WYSIWYGComponent extends UIComponent {
  public node!: WYSIWYGNode;

  public constructor(
    private readonly editor: WYSIWYGEditor,
    public readonly data: loom.Component
  ) {
    super(null!);

    this.autoCleanup(data.element.watch(this.update));

    editor.addNode(this);
  }

  private update = (node: loom.Element | loom.UnknownComponent): void => {
    this.el = this.node && this.node.getEl();
    const newNode = makeComponent(this.editor, node);
    this.editor.removeNode(this);
    if (this.el) this.changeEl(newNode.getEl());
    else this.el = newNode.getEl();
    if (this.node) this.node.destroy();
    this.node = newNode;
    this.editor.addNode(this);
  }

  public destroy(): void {
    this.node.destroy();
    super.destroy();
  }
}

export class WYSIWYGUnknown extends UIComponent {
  public readonly data = null;

  public constructor(editor: WYSIWYGEditor) {
    super(document.createComment('Unknown Component'));
  }
}

export default class WYSIWYGEditor extends UIComponent<{
  select: [WYSIWYGNode | null];
}> {
  private data: WeakMap<DataTypes, WYSIWYGNode> = new WeakMap();
  private nodes: WeakMap<Node, WYSIWYGNode> = new WeakMap();

  public constructor(private readonly ui: LoomUI) {
    super(makeElement('div', { className: 'wysiwyg-editor__container' }));

    this.appendChild(
      new Floating(new UIComponent(
        makeElement('div', { className: 'wysiwyg-editor' }),
        new Frame((doc: Document) => {
          const content = ui.content.get() as loom.Page | loom.Element;
          let head: UIComponent;
          let body: UIComponent;

          if (content instanceof loom.Page) {
            head = makeComponent(this, content.head, doc.head);
            body = makeComponent(this, content.body, doc.body);
          } else {
            head = new UIComponent(doc.head);
            body = makeComponent(this, content);
            body.addTo(doc.body);
          }

          const removeStyles = addStyles(doc, ui.globalStyles);

          doc.addEventListener('selectionchange', () => {
            const selection = doc.getSelection() || null;
            let node = selection && selection.focusNode;
            if (node && node.nodeType === 3) node = node.parentNode;
            const comp = node && this.nodes.get(node);
            this.select(comp || null);
          });

          doc.designMode = 'on';
          const observer = new MutationObserver(this.onEdit);
          observer.observe(doc, {
            characterData: true,
            attributes: true,
            childList: true,
            subtree: true
          });

          return () => {
            removeStyles();
            head.destroy();
            body.destroy();
            observer.disconnect();
          };
        }),
        new EditFrame(this)
      )));

    this.autoCleanup(ui.data.watch(data => {
      const comp = data && this.data.get(data) || null;
      if (comp) {
        const el = comp.getEl();
        if (el instanceof HTMLElement) el.scrollIntoView({ block: 'nearest' });
      }
      this.emit('select', comp);
    }));
  }

  public addNode(comp: WYSIWYGNode): void {
    this.nodes.set(comp.getEl(), comp);
    comp.data && this.data.set(comp.data, comp);
  }

  public removeNode(comp: WYSIWYGNode): void {
    this.nodes.delete(comp.getEl());
    comp.data && this.data.delete(comp.data);
  }

  public select(node: WYSIWYGNode | null): void {
    this.ui.data.set(node && node.data);
  }

  private onEdit = (records: MutationRecord[]): void => {
    records.forEach(record => {
      const node = record.target;
      const _comp = this.nodes.get(node);
      const comp = _comp instanceof WYSIWYGComponent
        ? _comp.node : _comp;
      if (!comp) return;

      // TODO: just do this once outside of the loop?
      node.normalize()

      switch (record.type) {
        case 'attributes':
          if (comp instanceof WYSIWYGElement && record.attributeName) {
            const key = record.attributeName
            const value = (node as Element).getAttributeNS(
              record.attributeNamespace,
              record.attributeName
            );
            value === null
              ? comp.data.attrs.source.delete(key)
              : comp.data.attrs.source.set(key, value);
          }
          break;
        case 'characterData':
          if (comp instanceof WYSIWYGTextNode) {
            comp.data.source.content.set(node.textContent || '');
          }
          break;
        case 'childList':
          if (comp instanceof WYSIWYGElement) {
            const nextEl = record.nextSibling;
            const nextComp = (nextEl && this.nodes.get(nextEl)) || null;
            record.addedNodes.forEach(newNode => {
              if (!this.nodes.has(newNode)) {
                comp.makeAndInsertBefore(newNode, nextComp);
              }
            });
            record.removedNodes.forEach(oldNode => {
              const oldComp = this.nodes.get(oldNode);
              if (oldComp) comp.deleteChild(oldComp);
            });
          }
          break;
      }
    });
  }
}