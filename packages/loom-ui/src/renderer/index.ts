import * as electron from 'electron';
import * as loom from 'loom-core';

import LoomUI from './LoomUI';

electron.ipcRenderer.on('open', (_, message) => {
  console.log('open', message);
});
electron.ipcRenderer.on('save', (_, message) => {
  console.log('save', message);
});
electron.ipcRenderer.on('export', (_, message) => {
  console.log('export', message);
});

window.addEventListener('load', function () {
  const sources = new loom.Sources(null);

  sources.components.set('Header',
    new loom.ElementDef('div', { 'class': 'header' }, [
      new loom.TextNodeDef('Test Site')
    ])
  );

  sources.pages.set('index.html', new loom.PageDef(
    new loom.HeadDef({}, []),
    new loom.BodyDef({}, [
      new loom.ComponentDef('Header'),
      new loom.ElementDef('p', {}, [
        new loom.TextNodeDef('this is the test site')
      ])
    ])
  ));

  sources.pages.set('about.html', new loom.PageDef(
    new loom.HeadDef({}, []),
    new loom.BodyDef({}, [
      new loom.ComponentDef('Header'),
      new loom.ElementDef('p', {}, [
        new loom.TextNodeDef('this is the about page')
      ])
    ])
  ));

  sources.styles.rules.add(new loom.StyleRuleDef(
    'body', {
      'white-space': 'pre-wrap',
      'color': '#222'
    }
  ));
  sources.styles.rules.add(new loom.StyleRuleDef(
    '.header', {
      'font-size': '2em',
      'color': 'red',
      'border-bottom': '3px solid #222'
    }
  ));

  new LoomUI(sources);
});