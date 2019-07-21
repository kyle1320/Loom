import Project from '../../data/Project';
import ComponentContentField from './ComponentContentField';
// import BasicField from '../BasicFields/BasicField';

export default {
  init(project: Project) {
    project.addFieldType(ComponentContentField);
    project.addDefaultFields(
      'component',
      // ['html.tag', new BasicField('div')],
      // ['html.innerContent', new BasicField('')],
      ['html.outerContent', new ComponentContentField()]
    );
  }
};