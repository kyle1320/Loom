import ComponentContentField from './ComponentContentField';
import Extension from '../Extension';
import Project from '../../../common/data/Project';
import Renderer from '../../Renderer';
import ComponentRenderer from './ComponentRenderer';

const ext: Extension = {
  initProject(project: Project) {
    project.addComputedFieldType(ComponentContentField);
    project.addDefaultFields(
      'component',
      ['html.outerContent', new ComponentContentField()]
    );
  },
  initRenderer(renderer: Renderer) {
    renderer.registerCategory({
      key: 'component',
      name: 'Component',
      paths: ['html.*'],
      sections: [
        {
          name: 'HTML',
          paths: [
            'html.tag',
            'html.innercontent',
            'html.outercontent'
          ]
        },
        {
          name: 'Attributes',
          paths: ['html.attr.*']
        }
      ]
    });

    renderer.registerObjectEditor('component', ComponentRenderer);

    renderer.registerFieldName('html.outercontent', 'HTML');
    renderer.registerFieldName('html.innercontent', 'Contents');
    renderer.registerFieldName('html.tag', 'HTML Tag');
    renderer.registerFieldName('html.attr.style', 'Style');
    renderer.registerFieldName('html.attr.onclick', 'Click Handler');
  }
};

export default ext;