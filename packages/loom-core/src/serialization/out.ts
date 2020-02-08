import path = require('path');

import { Sources, SourcesConfig } from '../definitions';
import { writeSync, LoomConfig } from '.';
import { Results } from '../build';

export function saveSources(sources: Sources, config: SourcesConfig): void {
  for (const file of sources.content.keys()) {
    writeSync(
      path.join(config.rootDir, config.sourcesRoot, file),
      sources.content.get(file)!.serialize()
    );
  }
  for (const name of sources.components.keys()) {
    writeSync(
      path.join(config.rootDir, config.componentsRoot, name + '.html'),
      sources.components.get(name)!.serialize()
    );
  }
  writeSync(path.join(config.rootDir, 'loom.json'), JSON.stringify({
    sourcesRoot: config.sourcesRoot,
    componentsRoot: config.componentsRoot,
    globalVars: sources.vars.asRecord()
  } as LoomConfig));
}

export function exportResults(results: Results, dir: string): void {
  for (const file of results.content.keys()) {
    writeSync(path.join(dir, file), results.content.get(file)!.serialize());
  }
}