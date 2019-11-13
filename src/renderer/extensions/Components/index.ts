import ComponentContentField from './ComponentContentField';
import Extension from '../Extension';
import Project from '../../../common/data/Project';
import Workspace from '../../Workspace';
import ComponentRenderer from './ComponentRenderer';
import ColorPicker from './ColorPicker';
import UIRegistry from '../../registry/UIRegistry';

function registerStyles(registry: UIRegistry): void {
  registry.registerFieldName('style.border', 'Border');
  registry.registerFieldName('style.background', 'Background');
  registry.registerFieldName('style.color', 'Font Color');
  registry.registerFieldName('style.font-size', 'Font Size');
  registry.registerFieldName('style.font-weight', 'Font Weight');

  registry.registerFieldEditor('style.color', ColorPicker);
}

function registerAttributes(registry: UIRegistry): void {
  registry.registerFieldName('html.attr.style', 'Style');
  registry.registerFieldName('html.attr.onclick', 'Click Handler');
}

const ext: Extension = {
  initProject(project: Project) {
    project.registerClass('component', {
      'html.outercontent()': new ComponentContentField()
    });
  },
  initWorkspace(workspace: Workspace) {
    const registry = workspace.registry;

    registry.registerCategory({
      name: 'HTML',
      paths: [
        'html.tag',
        'html.innercontent'
      ]
    });
    registry.registerCategory({
      name: 'Attributes',
      paths: ['html.attr.*']
    });
    registry.registerCategory({
      name: 'Styles',
      paths: ['style.*'],
    });

    registry.registerObjectEditor('component', ComponentRenderer);

    registry.registerFieldName('html.outercontent()', 'HTML');
    registry.registerFieldName('html.innercontent', 'Contents');
    registry.registerFieldName('html.tag', 'Tag');

    registerAttributes(registry);
    registerStyles(registry);
  }
};

export default ext;