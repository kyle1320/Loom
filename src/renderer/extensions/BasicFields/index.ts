import Project from '../../../common/data/Project';
import BasicField from './BasicField';
import Extension from '../Extension'

const ext: Extension = {
  initProject(project: Project) {
    project.addFieldType(BasicField);
  },
  initRenderer() {}
};

export default ext;