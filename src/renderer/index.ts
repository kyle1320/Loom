import ObjectEditor from './components/ObjectEditor/ObjectEditor';
import Project from '../common/data/Project';
import BasicField from '../common/extensions/BasicFields/BasicField';

window.addEventListener('load', function () {
  var project = new Project();

  var obj1 = project.makeObject('component');
  obj1.addOwnField(BasicField.factory('html.attr.style', '')(project));

  document.body.appendChild(new ObjectEditor(obj1).element);
});