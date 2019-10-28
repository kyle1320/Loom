import React from 'react';
import ReactDom from 'react-dom';

import LoomUI from './LoomUI';
import Renderer from './Renderer';
import MutableField from '../common/data/MutableField';

window.addEventListener('load', function () {
  const renderer = new Renderer();

  renderer.newProject();

  const project = renderer.getProject()!;

  const obj1 = project.makeObject('component');
  obj1.addOwnField('html.tag', new MutableField('button'));
  obj1.addOwnField('html.innerContent', new MutableField('Click Me'));
  obj1.addOwnField('html.attr.onclick', new MutableField('alert(\'Base\')'));
  obj1.addOwnField('style.color', new MutableField('red'));
  obj1.addOwnField('style.font-weight', new MutableField(''));
  obj1.addOwnField('style.border', new MutableField(''));

  const obj2 = project.makeObject('component', obj1);
  obj2.addOwnField('html.innerContent', new MutableField('Custom Text'));
  obj2.addOwnField('html.attr.onclick', new MutableField('alert(\'Custom\')'));
  obj2.addOwnField('test', new MutableField('Testing'));

  const obj3 = project.makeObject('component');
  obj3.addOwnField(
    'html.innerContent',
    new MutableField(`The button is: {${obj2.id}|html.outerContent}`)
  );

  ReactDom.render(
    <LoomUI renderer={renderer}></LoomUI>,
    document.getElementById('app')
  );
});