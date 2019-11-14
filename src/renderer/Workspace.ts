import Project from '../common/data/Project';
import Extension from './extensions/Extension';
import UIRegistry from './registry/UIRegistry';

const builtinExtensions: Extension[] = [
  require('./extensions/Components').default
];

// TODO:
// * keep track of current working directory
// * provide methods for loading / saving files
// * load extensions automatically from project
// * provide methods for opening dialog windows
// *
export default class Workspace {
  private project: Project | null = null;
  public readonly registry: UIRegistry = new UIRegistry();

  public constructor () {
    builtinExtensions.forEach(ex => {
      ex.initWorkspace?.(this);
    });
  }

  /** PROJECT **/

  public getProject(): Project | null {
    return this.project;
  }

  private setProject(project: Project): void {
    this.project = project;
  }

  public loadProject(data: Project.SerializedData): void {
    this.setProject(Project.deserialize(data, builtinExtensions));
  }

  public newProject(): Project {
    const proj = new Project();
    builtinExtensions.forEach(ex => proj.addExtension(ex));
    this.setProject(proj);
    return proj;
  }
}