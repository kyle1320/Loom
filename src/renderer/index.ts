import Renderer from './Renderer';
import ObjectEditor from './components/ObjectEditor/ObjectEditor';
import BasicField from './extensions/BasicFields/BasicField';

window.addEventListener('load', function () {
  const manager = new Renderer();
  const project = manager.makeProject();

  const obj1 = project.makeObject('component');
  obj1.addOwnField('html.tag', new BasicField('button'));
  obj1.addOwnField('html.innerContent', new BasicField('Click Me'));
  obj1.addOwnField('html.attr.onclick', new BasicField('alert(\'Base\')'));
  obj1.addOwnField('html.attr.style', new BasicField('color: red'));

  const obj2 = project.makeObject('component', obj1);
  obj2.addOwnField('html.innerContent', new BasicField('Custom Text'));
  obj2.addOwnField('html.attr.onclick', new BasicField('alert(\'Custom\')'));

  const obj3 = project.makeObject('component');
  obj3.addOwnField(
    'html.innerContent',
    new BasicField(`The button is: {${obj2.id}|html.outerContent}`)
  );

  document.body.appendChild(new ObjectEditor(obj1).element);
  document.body.appendChild(new ObjectEditor(obj2).element);
  document.body.appendChild(new ObjectEditor(obj3).element);
});