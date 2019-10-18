import Extension from '../Extension';
import Renderer from '../../Renderer';
import ColorPicker from './ColorPicker';

const ext: Extension = {
  initProject() {}, // eslint-disable-line
  initRenderer(renderer: Renderer) {
    renderer.registerCategory({
      key: 'styles',
      name: 'Styles',
      paths: ['style.*'],
      sections: []
    });

    renderer.registerFieldName('style.border', 'Border');
    renderer.registerFieldName('style.background', 'Background');
    renderer.registerFieldName('style.color', 'Font Color');
    renderer.registerFieldName('style.font-size', 'Font Size');
    renderer.registerFieldName('style.font-weight', 'Font Weight');

    renderer.registerFieldEditor('style.color', ColorPicker);
  }
};

export default ext;