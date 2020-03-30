import * as loom from 'loom-core';

import LoomUI, { DataTypes } from '@/LoomUI';
import { UIComponent } from '@/UIComponent';
import { Frame } from '@/common';
import { addStyles } from '@/util/css';
import { supportsText, isElement } from '@/util/html';

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
  editor: LiveDocument,
  node: loom.Node | loom.UnknownComponent,
  attach?: Node
): LiveNode {
  if (node instanceof loom.Element) {
    return new LiveElement(editor, node, attach as HTMLElement);
  } else if (node instanceof loom.TextNode) {
    return new LiveTextNode(editor, node, attach as Text);
  } else if (node instanceof loom.Component) {
    return new LiveComponent(editor, node);
  } else {
    return new LiveUnknown(editor);
  }
}

export type LiveNode
  = LiveElement
  | LiveTextNode
  | LiveComponent
  | LiveUnknown;

export class LiveElement extends UIComponent<{}, HTMLElement> {
  private ignoreEvents = false;

  public constructor(
    private readonly editor: LiveDocument,
    public readonly data: loom.Element,
    el?: HTMLElement
  ) {
    super();
    this.el = this.makeEl(el);

    this.destroy.do(
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
      ),
      () => editor.removeNode(this)
    );

    editor.addNode(this);
  }

  public makeAndInsertBefore(
    node: Node,
    comp: LiveNode | null
  ): LiveNode | null {
    const def = makeNodeDef(node)
    let res: LiveNode | null = null;
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

  public deleteChild(comp: LiveNode): void {
    comp.data && this.data.source.children.remove(comp.data.source);
  }

  private makeEl(el?: HTMLElement): HTMLElement {
    el = el || document.createElement(this.data.tag.get() || 'div');

    for (const key of this.data.attrs.keys()) {
      el.setAttribute(key, this.data.attrs.get(key)!);
    }

    el.addEventListener('mousedown', e => {
      e.stopPropagation();
      if (this.editor.ui.data.get() !== this.data) {
        e.preventDefault();
        this.editor.select(this);
      }
    });

    return el;
  }
}

export class LiveTextNode extends UIComponent {
  public constructor(
    editor: LiveDocument,
    public readonly data: loom.TextNode,
    el?: Text
  ) {
    super(el || document.createTextNode(data.content.get()));

    this.destroy.do(
      data.content.onOff('change', content => {
        if (content !== this.el.textContent) this.el.textContent = content;
      }),
      () => editor.removeNode(this)
    );

    editor.addNode(this);
  }
}

export class LiveComponent extends UIComponent {
  public node!: LiveNode;

  public constructor(
    private readonly editor: LiveDocument,
    public readonly data: loom.Component
  ) {
    super(null!);

    this.destroy.do(
      data.element.watch(this.update),
      () => {
        this.node.destroy();
        editor.removeNode(this);
      }
    );
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
}

export class LiveUnknown extends UIComponent {
  public readonly data = null;

  public constructor(editor: LiveDocument) {
    super(document.createComment('Unknown Component'));
  }
}

export default class LiveDocument extends Frame<{
  select: [LiveNode | null];
}> {
  private data: WeakMap<DataTypes, LiveNode> = new WeakMap();
  private nodes: WeakMap<Node, LiveNode> = new WeakMap();

  public constructor(
    public readonly ui: LoomUI,
    content: loom.Page | loom.Element
  ) {
    super((doc: Document) => {
      let head: UIComponent;
      let body: UIComponent;
      let root: loom.Element;

      if (content instanceof loom.Page) {
        head = makeComponent(this, content.head, doc.head);
        body = makeComponent(this, content.body, doc.body);
        root = content.body;
      } else {
        head = new UIComponent(doc.head);
        body = makeComponent(this, content);
        body.addTo(doc.body);
        root = content;
      }

      const removeStyles = addStyles(doc, ui.results.styles);

      doc.addEventListener('selectionchange', () => {
        if (ignoreEvents) return;

        const selection = doc.getSelection()!;
        const node = selection.focusNode;
        if (!node) return;
        const comp = node && this.nodes.get(node) || this.data.get(root);
        ignoreEvents = true;
        comp && this.select(comp);
        ignoreEvents = false;
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
    });

    let ignoreEvents = false;

    this.destroy.do(ui.data.watch(data => {
      const comp = data && this.data.get(data) || null;
      this.emit('select', comp);

      const node = data instanceof loom.Component
        ? data.element.get() : data;
      if (node instanceof loom.Element) {
        if (!node.children.size() && supportsText(node)) {
          node.children.addThrough(new loom.ElementDef('br'));
        }
      }

      if (ignoreEvents) return;

      if (comp) {
        let node: Node | null = comp.getEl();
        const doc = node.ownerDocument!;
        const selection = doc.getSelection()!;

        this.el.contentWindow!.blur();

        if (isElement(node)) {
          node.scrollIntoView({ block: 'nearest' });
          selection.removeAllRanges();
          console.log(node.firstElementChild, node.textContent);
          if (!node.firstElementChild || !node.textContent) {
            node = node.firstChild;
          } else {
            return;
          }
        }

        if (!node) return;
        console.log(node);

        ignoreEvents = true;

        const range = doc.createRange();
        range.selectNodeContents(node);

        selection.removeAllRanges();
        selection.addRange(range);

        const el = node && !isElement(node) ? node.parentElement : node;
        this.el.contentWindow!.setTimeout(() => {
          if (el && doc.body.contains(el)) {
            doc.body.focus();
            (el as HTMLElement).focus();
          }
          ignoreEvents = false;
        }, 0);
      } else {
        const doc = this.el.contentDocument;
        doc && doc.getSelection()!.removeAllRanges();
      }
    }));
  }

  public addNode(comp: LiveNode): void {
    this.nodes.set(comp.getEl(), comp);
    comp.data && this.data.set(comp.data, comp);
  }

  public removeNode(comp: LiveNode): void {
    this.nodes.delete(comp.getEl());
    comp.data && this.data.delete(comp.data);
  }

  public getNode(data: DataTypes): Node | null {
    const comp = this.data.get(data);
    return comp && comp.getEl() || null;
  }

  public select(node: LiveNode | null): void {
    this.ui.data.set(node && node.data);
  }

  private onEdit = (records: MutationRecord[]): void => {
    records.forEach(record => {
      const node = record.target;
      const _comp = this.nodes.get(node);
      const comp = _comp instanceof LiveComponent
        ? _comp.node : _comp;
      if (!comp) return;

      let needNormalize = false;

      switch (record.type) {
        case 'attributes':
          if (comp instanceof LiveElement && record.attributeName) {
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
          if (comp instanceof LiveTextNode) {
            comp.data.source.content.set(node.textContent || '');
            needNormalize = true;
          }
          break;
        case 'childList':
          if (comp instanceof LiveElement) {
            const nextEl = record.nextSibling;
            const nextComp = (nextEl && this.nodes.get(nextEl)) || null;
            record.addedNodes.forEach(newNode => {
              if (!this.nodes.has(newNode)) {
                comp.makeAndInsertBefore(newNode, nextComp);
                needNormalize = true;
              }
            });
            record.removedNodes.forEach(oldNode => {
              const oldComp = this.nodes.get(oldNode);
              if (oldComp) {
                comp.deleteChild(oldComp);
                needNormalize = true;
              }
            });
          }
          break;
      }

      if (needNormalize) node.normalize();
    });
  }
}