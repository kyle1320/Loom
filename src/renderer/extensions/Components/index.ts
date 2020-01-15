import ComponentContentField from './ComponentContentField';
import Extension from '../Extension';
import Project from '../../../common/data/Project';
import Workspace from '../../Workspace';
import ComponentEditor from './ComponentEditor';
import ColorPicker from './ColorPicker';
import UIRegistry from '../../registry/UIRegistry';

function registerStyles(registry: UIRegistry): void {
  registry.registerFields({
    key: 'style.border',
    friendlyName: 'Border'
  }, {
    key: 'style.background',
    friendlyName: 'Background'
  }, {
    key: 'style.color',
    friendlyName: 'Font Color'
  }, {
    key: 'style.font-size',
    friendlyName: 'Font Size'
  }, {
    key: 'style.font-weight',
    friendlyName: 'Font Weight'
  });

  registry.registerFieldEditor('style.color', ColorPicker);
}

function registerAttributes(registry: UIRegistry): void {
  registry.registerFields({
    key: 'html.attr.style',
    friendlyName: 'Style'
  }, {
    key: 'html.attr.onclick',
    friendlyName: 'Click Handler'
  });
}

const ext: Extension = {
  initProject(project: Project) {
    project.db.registerClass('component', {
      'html.outercontent()': new ComponentContentField()
    });
  },
  initWorkspace(workspace: Workspace) {
    const registry = workspace.registry;

    registry.registerCategories({
      name: 'HTML',
      paths: [
        'html.tag',
        'html.innercontent'
      ]
    }, {
      name: 'Attributes',
      paths: ['html.attr.*']
    }, {
      name: 'Styles',
      paths: ['style.*'],
    });

    registry.registerObjectEditor('component', ComponentEditor);

    registry.registerFields({
      key: 'html.innercontent',
      friendlyName: 'Contents'
    }, {
      key: 'html.tag',
      friendlyName: 'Tag',
      defaultValue: 'div'
    });

    registerAttributes(registry);
    registerStyles(registry);
  }
};

export default ext;