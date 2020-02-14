import * as loom from 'loom-core';

import LoomUI from '../../..';
import Floating from '../../../common/Floating';
import Frame from '../../../common/Frame';
import { makeElement } from '../../../util/dom';
import { UIComponent } from '../../../UIComponent';

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
  node: loom.Node,
  attach?: Node
): WYSIWYGNode {
  if (node instanceof loom.Element) {
    return new WYSIWYGElement(editor, node, attach as HTMLElement);
  } else if (node instanceof loom.TextNode) {
    return new WYSIWYGTextNode(editor, node, attach as Text);
  } else {
    return new WYSIWYGUnknown(editor);
  }
}

type WYSIWYGNode = WYSIWYGElement | WYSIWYGTextNode | WYSIWYGUnknown;

class WYSIWYGElement extends UIComponent<{}, HTMLElement> {
  private ignoreEvents = false;

  public constructor(
    private readonly editor: WYSIWYGEditor,
    public readonly data: loom.Element,
    el?: HTMLElement
  ) {
    super();
    this.el = this.makeEl(el);

    for (const node of this.data.children) {
      const child = makeComponent(this.editor, node);
      this.appendChild(child);
    }

    this.listen(data, 'tagChanged', () => {
      editor.removeNode(this);
      this.changeEl(this.makeEl());
      editor.addNode(this);
    });

    this.listen(data.attrs, 'set',
      ({ key, value }) => this.el.setAttribute(key, value));
    this.listen(data.attrs, 'delete', (key) => this.el.removeAttribute(key));

    this.listen(data.children, 'add', ({ index, value }) =>
      !this.ignoreEvents &&
      this.insertChild(makeComponent(editor, value), index));
    this.listen(data.children, 'remove', index =>
      !this.ignoreEvents &&
      this.removeChild(index));
    this.listen(data.children, 'update', ({ index, value }) =>
      this.setChild(makeComponent(editor, value), index));

    editor.addNode(this);
  }

  public makeAndInsertAfter(
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
        res = makeComponent(this.editor, el, node)
        this.children.splice(this.children.indexOf(comp), 0, res);
      }
    } else {
      const el = this.data.children.addDef(def);
      res = makeComponent(this.editor, el, node)
      this.children.push(res);
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
    el = el || document.createElement(this.data.tag || 'div');

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

class WYSIWYGTextNode extends UIComponent {
  public constructor(
    private readonly editor: WYSIWYGEditor,
    public readonly data: loom.TextNode,
    el?: Text
  ) {
    super(el || document.createTextNode(data.content));

    this.listen(data, 'contentChanged', content => {
      if (content !== this.el.textContent) this.el.textContent = content;
    });

    editor.addNode(this);
  }

  public destroy(): void {
    this.editor.removeNode(this);
    super.destroy();
  }
}

class WYSIWYGUnknown extends UIComponent {
  public readonly data = null;

  public constructor(editor: WYSIWYGEditor) {
    super(document.createComment('Unknown Component'));
  }
}

export default class WYSIWYGEditor extends UIComponent {
  private nodes: WeakMap<Node, WYSIWYGNode> = new WeakMap();

  public constructor(private readonly ui: LoomUI) {
    super(makeElement('div', { className: 'wysiwyg-editor' }),
      new Floating(new Frame((doc: Document) => {
        const content = ui.getSelectedContent() as loom.Page | loom.Element;
        let head: UIComponent | null = null;
        let body: UIComponent | null = null;

        if (content instanceof loom.Page) {
          head = makeComponent(this, content.head, doc.head);
          body = makeComponent(this, content.body, doc.body);
        } else {
          body = makeComponent(this, content);
          body.addTo(doc.body);
        }

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
          if (head) head.destroy();
          if (body) body.destroy();
          observer.disconnect();
        };
      })));
  }

  public addNode(comp: WYSIWYGNode): void {
    this.nodes.set(comp.getEl(), comp);
  }

  public removeNode(comp: WYSIWYGNode): void {
    this.nodes.delete(comp.getEl());
  }

  public select(node: WYSIWYGNode | null): void {
    this.ui.selectData(node && node.data);
  }

  private onEdit = (records: MutationRecord[]): void => {
    records.forEach(record => {
      const node = record.target;
      const comp = this.nodes.get(node);
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
            comp.data.source.content = node.textContent || '';
          }
          break;
        case 'childList':
          if (comp instanceof WYSIWYGElement) {
            const nextEl = record.nextSibling;
            const nextComp = (nextEl && this.nodes.get(nextEl)) || null;
            record.addedNodes.forEach(newNode => {
              if (!this.nodes.has(newNode)) {
                comp.makeAndInsertAfter(newNode, nextComp);
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