import * as loom from 'loom-core';

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
    rule.selector.watch(s => cssRule.selectorText = s)
  );
}

function attachStyle(
  cssStyle: CSSStyleDeclaration,
  style: loom.StyleDeclaration
): () => void {
  return style.watch(
    (key, value) => cssStyle.setProperty(key, value),
    key => cssStyle.removeProperty(key)
  );
}