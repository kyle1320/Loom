import Project from '../../data/Project';
import BasicField from './BasicField';
import DataExtension from '../DataExtension';

const ext: DataExtension = {
  initProject(project: Project) {
    project.addFieldType(BasicField);
  },
  initBuilder() {}
};

export default ext;