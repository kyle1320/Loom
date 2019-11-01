import Project from '../common/data/Project';
import Extension from './extensions/Extension';
import Components from './extensions/Components';
import UIRegistry from './registry/UIRegistry';

export interface CategorySection {
  name: string;
  paths: string[];
}
export interface Category extends CategorySection {
  key: string;
  sections: CategorySection[];
}

const allCategory = {
  key: '_all', name: 'All', paths: ['*'], sections: []
};
const computedCategory = {
  key: '_computed', name: 'Computed', paths: ['*()'], sections: []
};

export default class Renderer {
  private static readonly defaultExtensions: Extension[] = [
    Components
  ];

  private project: Project | null = null;
  public readonly registry: UIRegistry = new UIRegistry();

  private fieldCategories: Category[] = [allCategory];
  /** Map from field keys to user-friendly names */
  private fieldNames: Map<string, string> = new Map();


  public constructor () {
    Renderer.defaultExtensions.forEach(ex => {
      ex.initRenderer && ex.initRenderer(this);
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
    this.setProject(Project.deserialize(data, Renderer.defaultExtensions));
  }

  public newProject(): void {
    const proj = new Project();
    Renderer.defaultExtensions.forEach(ex => proj.addExtension(ex));
    this.setProject(proj);
  }

  /** CATEGORIES **/

  public registerCategory(category: Category): void {
    this.fieldCategories.push(category);
  }

  public getCategories(): Category[] {
    return this.fieldCategories.concat([ computedCategory ]);
  }

  public getDefaultCategory(): Category {
    return this.fieldCategories[0];
  }

  /** FIELD NAMES **/

  public registerFieldName(key: string, name: string): void {
    this.fieldNames.set(key.toLowerCase(), name);
  }

  public getFieldName(key: string): string | undefined {
    return this.fieldNames.get(key.toLowerCase());
  }
}