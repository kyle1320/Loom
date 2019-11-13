import Project from '../common/data/Project';
import Extension from './extensions/Extension';
import Components from './extensions/Components';
import UIRegistry from './registry/UIRegistry';

export default class Workspace {
  private static readonly defaultExtensions: Extension[] = [
    Components
  ];

  private project: Project | null = null;
  public readonly registry: UIRegistry = new UIRegistry();

  public constructor () {
    Workspace.defaultExtensions.forEach(ex => {
      ex.initWorkspace?.(this);
    });
  }

  /** PROJECT **/

  public getProject(): Project | null {
    return this.project;
  }

  public setProject(project: Project): void {
    this.project = project;
  }

  public loadProject(data: Project.SerializedData): void {
    this.setProject(Project.deserialize(data, Workspace.defaultExtensions));
  }

  public newProject(): void {
    const proj = new Project();
    Workspace.defaultExtensions.forEach(ex => proj.addExtension(ex));
    this.setProject(proj);
  }
}