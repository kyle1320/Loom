import ObjectEditor from './components/ObjectEditor/ObjectEditor';
import Project from '../common/data/Project';
import BasicField from '../common/extensions/BasicFields/BasicField';

window.addEventListener('load', function () {
  var project = new Project();

  var obj1 = project.makeObject('user');
  obj1.addOwnField(new BasicField(project, obj1, 'primaryColor', 'red'));

  var obj2 = project.makeObject('user');
  obj2.addOwnField(new BasicField(project, obj1, 'border', `1px solid {${obj1.id}|primaryColor}`));

  var obj3 = project.makeObject('user', obj2);
  obj3.addOwnField(new BasicField(project, obj1, 'attr6', `some value`));

  // Make sure serialization works
  project = Project.deserialize(project.serialize());
  obj1 = project.objects.fetch(obj1.id)!;
  obj2 = project.objects.fetch(obj2.id)!;
  obj3 = project.objects.fetch(obj3.id)!;

  document.body.appendChild(new ObjectEditor(obj1).element);
  document.body.appendChild(new ObjectEditor(obj2).element);
  document.body.appendChild(new ObjectEditor(obj3).element);
});