import Project from '../../data/Project';
import ComponentContentField from './ComponentContentField';
import DataExtension from '../DataExtension';

const ext: DataExtension = {
  initProject(project: Project) {
    project.addFieldType(ComponentContentField);
    project.addDefaultFields(
      'component',
      ['html.outerContent', new ComponentContentField()]
    );
  }
};

export default ext;