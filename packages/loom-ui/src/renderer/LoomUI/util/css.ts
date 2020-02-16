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
  const rules = sheet.rules;
  const cleanup: (() => void)[] = [];

  for (let i = 0; i < rules.size(); i++) {
    cssSheet.insertRule(rules.get(i).serialize(), i);
    cleanup.push(
      attachRule(cssSheet.cssRules.item(i) as CSSStyleRule, rules.get(i))
    );
  }

  return many(
    rules.onOff(
      'add', ({ index, value }) => {
        cssSheet.insertRule(value.serialize(), index);
        cleanup.splice(index, 0,
          attachRule(cssSheet.cssRules.item(index) as CSSStyleRule, value)
        );
      }
    ),
    rules.onOff(
      'remove', (index: number) => {
        cssSheet.removeRule(index)
        cleanup.splice(index, 1)[0]();
      }
    ),
    () => cleanup.forEach(cb => cb())
  );
}

function attachRule(
  cssRule: CSSStyleRule,
  rule: loom.StyleRule
): () => void {
  cssRule.selectorText = rule.selector;

  return many(
    attachStyle(cssRule.style, rule.style),
    rule.onOff('selectorChanged', s => cssRule.selectorText = s)
  );
}

function attachStyle(
  cssStyle: CSSStyleDeclaration,
  style: loom.StyleDeclaration
): () => void {
  for (const key of style.keys()) {
    cssStyle.setProperty(key, style.get(key)!);
  }

  return many(
    style.onOff('set', ({ key, value }) => cssStyle.setProperty(key, value)),
    style.onOff('delete', key => cssStyle.removeProperty(key))
  );
}