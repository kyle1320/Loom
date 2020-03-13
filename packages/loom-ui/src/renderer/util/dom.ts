type JSXChild = HTMLElement | string | number | boolean | null | undefined;
export type ElementContent = JSXChild | JSXChild[];

type ElementProps<T extends keyof HTMLElementTagNameMap> = {
  [K in keyof HTMLElementTagNameMap[T]]?: K extends 'style'
    ? Partial<CSSStyleDeclaration>
    : HTMLElementTagNameMap[T][K]
}

export function makeElement<T extends keyof HTMLElementTagNameMap>(
  tag: T,
  props?: ElementProps<T>,
  ...children: ElementContent[]
): HTMLElementTagNameMap[T] {
  const el = document.createElement(tag);

  for (const key in props) {
    if (key === 'style') {
      Object.assign(el.style, props.style);
    } else if (
      typeof props[key] === 'function' && key[0] === 'o' && key[1] === 'n'
    ) {
      el.addEventListener(
        key.substr(2),
        (props[key] as unknown) as EventListenerOrEventListenerObject
      );
    } else {
      (el[key as keyof HTMLElementTagNameMap[T]] as unknown) = props[key];
    }
  }

  children.forEach(function addChild(child) {
    if (child instanceof Array) {
      child.forEach(addChild);
    } else if (child instanceof Node) {
      el.appendChild(child);
    } else if (child) {
      el.appendChild(document.createTextNode(String(child)));
    }
  });

  return el;
}

export function toggleClass(
  el: HTMLElement,
  className: string,
  enabled?: boolean
): void {
  const regexp = new RegExp('\\s*' + className, 'g');

  if (typeof enabled === 'undefined') {
    enabled = !regexp.test(el.className);
  } else if (enabled && regexp.test(el.className)) {
    return;
  }

  if (enabled) {
    el.className += ' ' + className;
  } else {
    el.className = el.className.replace(regexp, '');
  }
}