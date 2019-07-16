type JSXChild = HTMLElement | string | number | boolean | null | undefined;
export type ElementContent = JSXChild | JSXChild[];

export function makeElement<T extends keyof JSX.IntrinsicElements>(
  tag: T,
  props?: JSX.IntrinsicElements[T],
  ...children: ElementContent[]
): HTMLElementTagNameMap[T] {
  var el = document.createElement(tag);

  for (var key in props) {
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
      (el as any)[key] = props[key];
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
) {
  var regexp = new RegExp('\\s*' + className, 'g');

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
