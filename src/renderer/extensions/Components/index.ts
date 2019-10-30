import ComponentContentField from './ComponentContentField';
import Extension from '../Extension';
import Project from '../../../common/data/Project';
import Renderer from '../../Renderer';
import ComponentRenderer from './ComponentRenderer';
import ColorPicker from './ColorPicker';

function registerStyles(renderer: Renderer): void {
  renderer.registerFieldName('style.border', 'Border');
  renderer.registerFieldName('style.background', 'Background');
  renderer.registerFieldName('style.color', 'Font Color');
  renderer.registerFieldName('style.font-size', 'Font Size');
  renderer.registerFieldName('style.font-weight', 'Font Weight');

  renderer.registerFieldEditor('style.color', ColorPicker);
}

function registerAttributes(renderer: Renderer): void {
  renderer.registerFieldName('html.attr.style', 'Style');
  renderer.registerFieldName('html.attr.onclick', 'Click Handler');
}

const ext: Extension = {
  initProject(project: Project) {
    project.registerClass('component', {
      'html.outercontent()': new ComponentContentField()
    });
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
            'html.innercontent'
          ]
        },
        {
          name: 'Attributes',
          paths: ['html.attr.*']
        },
        {
          name: 'Styles',
          paths: ['style.*'],
        }
      ]
    });

    renderer.registerObjectEditor('component', ComponentRenderer);

    renderer.registerFieldName('html.outercontent()', 'HTML');
    renderer.registerFieldName('html.innercontent', 'Contents');
    renderer.registerFieldName('html.tag', 'Tag');

    registerAttributes(renderer);
    registerStyles(renderer);
  }
};

export default ext;