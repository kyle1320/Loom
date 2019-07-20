import Project from '../../data/Project';
import BasicField from './BasicField';

export default {
  init(project: Project) {
    project.addFieldType(BasicField);
  }
};