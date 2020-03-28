import * as loom from 'loom-core';
import { Destroyable } from 'loom-data/src';

function many(...callbacks: (() => void)[]): () => void {
  return () => callbacks.forEach(cb => cb());
}

export function addStyles(doc: Document, sheet: loom.Sheet): () => void {
  const el = doc.createElement('style');

  doc.head.appendChild(el);

  return attachRules(el.sheet as CSSStyleSheet, sheet);
}

function attachRules(
  cssSheet: CSSStyleSheet,
  sheet: loom.Sheet
): () => void {
  const cleanup: (() => void)[] = [];

  cleanup.push(sheet.rules.watch(
    (index, value) => {
      cssSheet.insertRule(value.serialize(), index);
      cleanup.splice(index, 0,
        attachRule(cssSheet.cssRules.item(index) as CSSStyleRule, value)
      );
    },
    (index) => {
      cssSheet.removeRule(index)
      cleanup.splice(index, 1)[0]();
    }
  ));

  return () => cleanup.forEach(cb => cb());
}

function attachRule(
  cssRule: CSSStyleRule,
  rule: loom.StyleRule
): () => void {
  return many(
    attachStyle(cssRule.style, rule.style),
    rule.selector.watch(s => void (cssRule.selectorText = s))
  );
}

function attachStyle(
  cssStyle: CSSStyleDeclaration,
  style: loom.StyleDeclaration
): () => void {
  return style.watch({
    set: (key, value) => {
      cssStyle.setProperty(key, '');
      cssStyle.setProperty(key, value);
    },
    delete: key => cssStyle.removeProperty(key)
  });
}

export class InlineStyleRuleDef
  extends loom.StyleRuleDef
  implements Destroyable {

  public destroy = Destroyable.make();

  public constructor(style: CSSStyleDeclaration) {
    super('(inline)', new InlineStyleDeclarationDef(style));

    this.destroy.do(this.style);
  }
}

class InlineStyleDeclarationDef extends loom.StyleDeclarationDef {
  public constructor(private readonly style: CSSStyleDeclaration) {
    super();

    this.watch({
      set: (key, value) => style.setProperty(key, value),
      delete: key => style.removeProperty(key)
    });

    this.update();
  }

  public update(): void {
    const keys = new Set(this.keys());
    for (let i = 0; i < this.style.length; i++) {
      const key = this.style.item(i);
      this.set(key, this.style.getPropertyValue(key));
      keys.delete(key);
    }
    for (const removed of keys) {
      this.delete(removed);
    }
  }
}