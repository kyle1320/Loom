import Project from '../../../common/data/Project';
import BasicField from './BasicField';
import Extension from '../Extension'
import Renderer from '../../Renderer';
import BasicFieldEditor from './BasicFieldEditor';

const ext: Extension = {
  initProject(project: Project) {
    project.addFieldType(BasicField);
  },
  initRenderer(renderer: Renderer) {
    renderer.registerRawFieldEditor(BasicField.name, BasicFieldEditor);
  }
};

export default ext;