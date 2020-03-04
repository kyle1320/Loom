import * as fs from 'fs';
import * as path from 'path';
import * as cssparser from 'css';

import { SheetDef, StyleRuleDef } from '../definitions/CSS';

export function importStylesheet(
  root: string,
  file: string,
  def: SheetDef
): void {
  const sheet = cssparser.parse(
    fs.readFileSync(path.join(root, file)).toString()
  );

  sheet.stylesheet?.rules.forEach(rule => {
    if (rule.type === 'rule') {
      def.rules.add(parseStyleRule(rule as cssparser.Rule))
    }
  });
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