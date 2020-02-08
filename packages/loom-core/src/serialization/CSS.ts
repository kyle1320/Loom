import fs = require('fs');
import path = require('path');
import cssparser = require('css');

import { SheetDef, RuleDef, StyleRuleDef } from '../definitions/CSS';

export function importStylesheet(
  root: string,
  file: string
): SheetDef {
  const sheet = cssparser.parse(
    fs.readFileSync(path.join(root, file)).toString()
  );

  const rules: RuleDef[] = [];

  sheet.stylesheet?.rules.forEach(rule => {
    if (rule.type === 'rule') {
      rules.push(parseStyleRule(rule as cssparser.Rule))
    }
  });

  return new SheetDef(rules);
}

function parseStyleRule(rule: cssparser.Rule): StyleRuleDef {
  const style: Record<string, string> = {};

  rule.declarations?.forEach(x => {
    if (x.type === 'declaration') {
      const dec = x as cssparser.Declaration;
      style[dec.property!] = dec.value || '';
    }
  })

  return new StyleRuleDef(rule.selectors?.join(', ') || '', style);
}