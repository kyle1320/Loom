import Project from '../../data/Project';
import ComponentContentField from './ComponentContentField';
import BasicField from '../BasicFields/BasicField';

export default {
  init(project: Project) {
    project.addFieldType(ComponentContentField);
    project.addDefaultFields(
      'component',
      BasicField.factory('html.tag', 'div'),
      BasicField.factory('html.innerContent', ''),
      ComponentContentField.factory('html.outerContent')
    );
  }
};