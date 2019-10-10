import ComponentContentField from './ComponentContentField';
import Extension from '../Extension';
import Project from '../../../common/data/Project';
import Renderer from '../../Renderer';
import ComponentRenderer from './ComponentRenderer';

const ext: Extension = {
  initProject(project: Project) {
    project.addFieldType(ComponentContentField);
    project.addDefaultFields(
      'component',
      ['html.outerContent', new ComponentContentField()]
    );
  },
  initRenderer(renderer: Renderer) {
    renderer.registerCategory({
      key: 'component',
      name: 'Component',
      path: 'html.*'
    });
    renderer.registerObjectEditor('component', ComponentRenderer);
  }
};

export default ext;