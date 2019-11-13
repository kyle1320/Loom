import Project from '../data/Project';

export default interface DataExtension {
  initProject?(project: Project): void;
}
