import * as loom from 'loom-core';

import LoomUI from './LoomUI';

window.addEventListener('load', function () {
  const sources = new loom.Sources(null, {
    title: 'test',
    color: '#F0F0FF'
  });

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

  new LoomUI(sources);
});