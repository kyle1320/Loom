type JSXChild = Node | string | number | boolean | null | undefined;
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

export function parseDescriptor(descriptor: string): HTMLElement {
  let tag = '';
  let id = '';
  const classes = [];
  let pushClass = false, pushId = false;

  for (const part of descriptor.split(/([.#])/g)) {
    switch (part) {
      case '.': pushClass = true; break;
      case '#': pushId = true; break;
      default:
        if (pushClass) classes.push(part);
        else if (pushId) id = part;
        else tag = part;
        pushClass = pushId = false;
    }
  }

  const el = document.createElement(tag || 'div');
  if (id) el.id = id;
  if (classes) el.className = classes.join(' ');
  return el;
}

export function parseContents(contents: string): Node[] {
  // TODO: support nested elements?
  return contents.split(/(\{.*?\})/g).map(s => {
    if (s[0] === '{' && s[s.length - 1] === '}') {
      return parseElement(s.substring(1, s.length - 1));
    } else {
      return document.createTextNode(s);
    }
  });
}

export function parseElement(str: string): HTMLElement {
  const space = str.indexOf(' ');
  const el = parseDescriptor(space < 0 ? str : str.substring(0, space));
  const contents = space < 0 ? '' : str.substring(space + 1);

  for (const child of parseContents(contents)) {
    el.appendChild(child);
  }

  return el;
}