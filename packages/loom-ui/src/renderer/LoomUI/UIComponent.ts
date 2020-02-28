import { EventEmitter } from 'loom-data';

export class UIComponent<
  E = {}, H extends Node = Node
> extends EventEmitter<E> {
  private unlisteners: Set<() => void> = new Set();

  protected parent: UIComponent | null = null;
  protected children: UIComponent[] = [];

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
    while (this.children.length) {
      this.children[0].destroy();
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

    this.children.forEach(child => child.addTo(el));
  }

  protected appendChild(comp: UIComponent): void {
    comp.parent = this;
    this.children.push(comp);
    this.el.appendChild(comp.el);
  }

  protected insertChild(comp: UIComponent, index = this.children.length): void {
    if (index === this.children.length) {
      this.appendChild(comp);
    } else {
      comp.parent = this;
      this.el.insertBefore(comp.el, this.children[index].el);
      this.children.splice(index, 0, comp);
    }
  }

  protected removeChild(comp: UIComponent | number, destroy = true): void {
    if (typeof comp !== 'number') {
      comp = this.children.indexOf(comp);
    }

    if (comp > -1) {
      comp = this.children.splice(comp, 1)[0];
      try { this.el.removeChild(comp.el); } catch (e) { /**/ }
      destroy && comp.destroy();
    }
  }

  protected setChild(child: UIComponent, index: number): void {
    this.removeChild(index);
    this.insertChild(child, index);
  }
}