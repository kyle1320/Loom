import ObjectEditor from './components/ObjectEditor/ObjectEditor';
import Project from '../common/data/Project';
import BasicField from '../common/extensions/BasicFields/BasicField';

window.addEventListener('load', function () {
  const project = new Project();

  const obj1 = project.makeObject('component');
  obj1.addOwnField('html.tag', new BasicField('button'));
  obj1.addOwnField('html.innerContent', new BasicField('Click Me'));
  obj1.addOwnField('html.attr.style', new BasicField('color: red'));

  const obj2 = project.makeObject('component', obj1);
  obj2.addOwnField('html.innerContent', new BasicField('Custom Text'));

  const obj3 = project.makeObject('component', );
  obj3.addOwnField(
    'html.innerContent',
    new BasicField(`The button is: {${obj2.id}|html.outerContent}`)
  );

  document.body.appendChild(new ObjectEditor(obj1).element);
  document.body.appendChild(new ObjectEditor(obj2).element);
  document.body.appendChild(new ObjectEditor(obj3).element);
});