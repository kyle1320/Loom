export type Manager = (node: HTMLElement | null) => void;

export function manage(
  cb: (node: HTMLElement) => (() => void) | undefined
): Manager {
  let curNode: HTMLElement | null = null;
  let onRemove: (() => void) | null | undefined;

  return (node: HTMLElement | null) => {
    if (curNode && curNode != node) {
      onRemove && onRemove();
      onRemove = null
    }

    curNode = node;

    if (node) {
      onRemove = cb(node);
    }
  };
}

export function manageMany(...managers: Manager[]): Manager {
  return (node: HTMLElement | null) => {
    managers.forEach(m => m(node));
  };
}