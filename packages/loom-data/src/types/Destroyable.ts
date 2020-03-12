export namespace Destroyable {
  export interface DestroyFunction {
    (): void;
    do: (...callbacks: ((() => void) | null | undefined)[]) => void;
  }

  export const make = (
    ...callbacks: ((() => void) | null | undefined)[]
  ): DestroyFunction => {
    let unlisteners: Set<() => void>;

    function destroy(): void {
      unlisteners.forEach(cb => cb());
    }

    destroy.do = (...callbacks: ((() => void) | null | undefined)[]): void => {
      if (!unlisteners) unlisteners = new Set();

      callbacks.forEach(cb => cb && unlisteners.add(function remove() {
        unlisteners.delete(remove) && cb();
      }));
    };

    destroy.do(...callbacks);

    return destroy;
  };
}

interface Destroyable {
  readonly destroy: Destroyable.DestroyFunction;
}

export default Destroyable;