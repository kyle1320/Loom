import * as loom from 'loom-core';

export class UIComponent<
  E = {}, H extends Node = Node
> extends loom.EventEmitter<E> {
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
    this.el.parentNode?.removeChild(this.el);
    for (const child of this.children) {
      child.destroy();
    }
    this.allOff();
    this.unlisteners.forEach(cb => cb());
    if (this.parent) {
      this.parent.removeChild(this, false);
    }
  }

  public addTo(node: Node): void {
    node.appendChild(this.el);
  }

  protected listen<E, K extends keyof E>(
    data: loom.EventEmitter<E>,
    event: K,
    cb: (data: E[K], event: K) => void
  ): () => void {
    data.on(event, cb)
    const remove = (): void => {
      if (this.unlisteners.delete(remove)) {
        data.off(event, cb);
      }
    }
    this.unlisteners.add(remove);
    return remove;
  }

  protected empty(): void {
    for (const child of this.children) {
      child.destroy();
    }
  }

  protected changeEl(el: H): void {
    if (this.el instanceof HTMLElement) {
      this.el.replaceWith(el);
    } else {
      this.el.parentNode?.insertBefore(this.el, el);
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
      comp = this.children.splice(comp, 0)[0];
      destroy && comp.destroy();
    }
  }

  protected setChild(child: UIComponent, index: number): void {
    this.removeChild(index);
    this.insertChild(child, index);
  }
}