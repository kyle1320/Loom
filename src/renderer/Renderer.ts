import Project from '../common/data/Project';
import Extension from './extensions/Extension';

import BasicFields from './extensions/BasicFields';
import Components from './extensions/Components';

export default class Renderer {
  private static readonly defaultExtensions: Extension[] = [
    BasicFields,
    Components
  ];

  public makeProject(): Project {
    const proj = new Project();
    Renderer.defaultExtensions.forEach(ex => proj.addExtension(ex));
    return proj;
  }

  public loadProject(data: Project.SerializedData): Project {
    return Project.deserialize(data, Renderer.defaultExtensions);
  }
}