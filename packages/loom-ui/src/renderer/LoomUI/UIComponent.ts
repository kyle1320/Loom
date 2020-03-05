import { EventEmitter } from 'loom-data';

export class UIComponent<
  E = {}, H extends Node = Node
> extends EventEmitter<E> {
  private unlisteners: Set<() => void> = new Set();

  private parent: UIComponent | null = null;
  private __children: UIComponent[] = [];

  // TODO use in subclasses
  protected children: Readonly<UIComponent[]> = this.__children;

  public constructor(
    protected el: H = null!,
    ...children: UIComponent[]
  ) {
    super();

    children.forEach(comp => this.appendChild(comp));
  }

  public destroy(): void {
    this.empty();
    this.allOff();
    this.unlisteners.forEach(cb => cb());
    if (this.parent) {
      this.parent.removeChild(this, false);
    }
  }

  public addTo(node: Node): void {
    node.appendChild(this.el);
  }

  public getEl(): H {
    return this.el;
  }

  protected numChildren(): number {
    return this.__children.length;
  }

  protected autoCleanup(...callbacks: (() => void)[]): () => void {
    const remove = (): void => {
      if (this.unlisteners.delete(remove)) {
        callbacks.forEach(cb => cb());
      }
    }
    this.unlisteners.add(remove);
    return remove;
  }

  protected empty(): void {
    while (this.__children.length) {
      this.__children[0].destroy();
    }
  }

  protected changeEl(el: H): void {
    if (this.el instanceof HTMLElement) {
      this.el.replaceWith(el);
    } else {
      this.el.parentNode?.insertBefore(el, this.el);
      this.el.parentNode?.removeChild(this.el);
    }

    this.el = el;

    this.__children.forEach(child => child.addTo(el));
  }

  protected appendChild(comp: UIComponent, insert = true): void {
    comp.parent = this;
    this.__children.push(comp);
    insert && this.el.appendChild(comp.el);
  }

  protected insertChild(
    comp: UIComponent,
    index = this.__children.length,
    insert = true
  ): void {
    if (index === this.__children.length) {
      this.appendChild(comp, insert);
    } else {
      comp.parent = this;
      insert && this.el.insertBefore(comp.el, this.__children[index].el);
      this.__children.splice(index, 0, comp);
    }
  }

  protected insertBefore(
    comp: UIComponent,
    before: UIComponent,
    insert = true
  ): void {
    this.insertChild(comp, this.__children.indexOf(before), insert);
  }

  protected removeChild(comp: UIComponent | number, destroy = true): void {
    if (typeof comp !== 'number') {
      comp = this.__children.indexOf(comp);
    }

    if (comp > -1) {
      comp = this.__children.splice(comp, 1)[0];
      try { this.el.removeChild(comp.el); } catch (e) {
        console.warn('Failed to remove node');
      }
      comp.parent = null;
      destroy && comp.destroy();
    }
  }

  protected setChild(child: UIComponent, index: number, insert = true): void {
    this.removeChild(index, insert);
    this.insertChild(child, index, insert);
  }
}