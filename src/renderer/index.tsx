import Renderer from './Renderer';
import BasicField from './extensions/BasicFields/BasicField';

import React from 'react';
import ReactDom from 'react-dom';
import LoomUI from './LoomUI';

window.addEventListener('load', function () {
  const renderer = new Renderer();

  renderer.newProject();

  const project = renderer.getProject()!;

  const obj1 = project.makeObject('component');
  obj1.addOwnField('html.tag', new BasicField('button'));
  obj1.addOwnField('html.innerContent', new BasicField('Click Me'));
  obj1.addOwnField('html.attr.onclick', new BasicField('alert(\'Base\')'));
  obj1.addOwnField('html.attr.style', new BasicField('color: red'));

  const obj2 = project.makeObject('component', obj1);
  obj2.addOwnField('html.innerContent', new BasicField('Custom Text'));
  obj2.addOwnField('html.attr.onclick', new BasicField('alert(\'Custom\')'));
  obj2.addOwnField('test', new BasicField('Testing'));

  const obj3 = project.makeObject('component');
  obj3.addOwnField(
    'html.innerContent',
    new BasicField(`The button is: {${obj2.id}|html.outerContent}`)
  );

  ReactDom.render(
    <LoomUI renderer={renderer}></LoomUI>,
    document.getElementById('app')
  );
});