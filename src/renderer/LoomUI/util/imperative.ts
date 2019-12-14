export type Manager<E extends HTMLElement = HTMLElement>
  = (node: E | null) => void;

export function manage<E extends HTMLElement = HTMLElement>(
  cb: (node: E) => (() => void) | undefined
): Manager<E> {
  let curNode: E | null = null;
  let onRemove: (() => void) | null | undefined;

  return (node: E | null) => {
    if (curNode && curNode != node) {
      onRemove?.();
      onRemove = null
    }

    curNode = node;

    if (node) {
      onRemove = cb(node);
    }
  };
}

export function manageMany<E extends HTMLElement>(
  ...managers: Manager<E>[]
): Manager<E> {
  return (node: E | null) => {
    managers.forEach(m => m(node));
  };
}