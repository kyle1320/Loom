import fs = require('fs');
import path = require('path');

import { Sources } from '../definitions';
import { importPage, importComponents } from './HTML';
import { importStylesheet } from './CSS';
import { walkDir, LoomConfig } from '.';

export function importSources(rootDir: string): Sources {
  const config = JSON.parse(
    fs.readFileSync(path.join(rootDir, 'loom.json')).toString()
  ) as LoomConfig;
  const res = new Sources({
    rootDir,
    sourcesRoot: config.sourcesRoot || 'src',
    componentsRoot: config.componentsRoot || 'components'
  }, config.globalVars);
  const componentsRoot = path.join(rootDir, res.config!.componentsRoot);
  const sourcesRoot = path.join(rootDir, res.config!.sourcesRoot);

  importComponents(componentsRoot, res);

  importStylesheet(sourcesRoot, 'site.css', res.styles);

  walkDir(sourcesRoot, rel => {
    switch (path.parse(rel).ext) {
      case '.html':
      case '.htm':
        res.pages.set(rel, importPage(sourcesRoot, rel));
        break;
    }
  });

  return res;
}