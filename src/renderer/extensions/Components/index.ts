import ComponentContentField from './ComponentContentField';
import Extension from '../Extension';
import Project from '../../../common/data/Project';

const ext: Extension = {
  initProject(project: Project) {
    project.addFieldType(ComponentContentField);
    project.addDefaultFields(
      'component',
      ['html.outerContent', new ComponentContentField()]
    );
  },
  initRenderer() {}
};

export default ext;