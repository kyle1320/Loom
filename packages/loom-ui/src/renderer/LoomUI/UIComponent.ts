import * as loom from 'loom-core';

export class UIComponent<
  E = {}, H extends Node = Node
> extends loom.EventEmitter<E> {
  private unlisteners: Set<() => void> = new Set();

  protected parent: UIComponent | null = null;
  protected children: UIComponent[] = [];

  public constructor(
    protected el: H = null!
  ) {
    super();
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

  protected appendChild(comp: UIComponent): void {
    comp.parent = this;
    this.children.push(comp);
    this.el.appendChild(comp.el);
  }

  protected removeChild(comp: UIComponent, destroy = true): void {
    const index = this.children.indexOf(comp);

    if (index > -1) {
      comp = this.children.splice(index, 0)[0];
      destroy && comp.destroy();
    }
  }
}