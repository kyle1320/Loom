namespace Destroyable {
  export type DestroyValue = Destroyable | (() => void) | null | undefined;

  export interface DestroyFunction {
    (): void;
    do: (...data: DestroyValue[]) => void;
  }

  export const make = (...data: DestroyValue[]): DestroyFunction => {
    let unlisteners: Set<() => void>;

    function destroy(): void {
      unlisteners.forEach(cb => cb());
    }

    destroy.do = (...data:  DestroyValue[]): void => {
      if (!unlisteners) unlisteners = new Set();

      data.forEach(d => {
        if (!d) return;
        const cb = typeof d === 'object' ? d.destroy : d;
        unlisteners.add(function remove() {
          unlisteners.delete(remove) && cb();
        });
      });
    };

    destroy.do(...data);

    return destroy;
  };
}

interface Destroyable {
  readonly destroy: Destroyable.DestroyFunction;
}

export default Destroyable;