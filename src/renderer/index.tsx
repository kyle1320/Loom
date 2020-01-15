import React from 'react';
import ReactDom from 'react-dom';

import LoomUI from './LoomUI';
import Workspace from './Workspace';

window.addEventListener('load', function () {
  const workspace = new Workspace();

  workspace.newProject();

  const project = workspace.getProject()!;

  const obj1 = project.db.makeObject('button', 'component');
  obj1.addOwnField('html.tag', 'button');
  obj1.addOwnField('html.innerContent', 'Click Me');
  obj1.addOwnField('html.attr.onclick', 'alert(\'Base\')');
  obj1.addOwnField('style.color', 'red');

  const obj2 = project.db.makeObject('button/customButton', obj1);
  obj2.addOwnField('html.innerContent', 'Custom Text');
  obj2.addOwnField('html.attr.onclick', 'alert(\'Custom\')');
  obj2.addOwnField('test', 'Testing');

  const obj3 = project.db.makeObject('buttonUser', 'component');
  obj3.addOwnField(
    'html.innerContent',
    `The button is: {${obj2.id}|html.outercontent()}`
  );

  ReactDom.render(
    <LoomUI workspace={workspace}></LoomUI>,
    document.getElementById('app')
  );
});