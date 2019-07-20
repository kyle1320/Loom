import Project from '../data/Project';

/* eslint-disable semi */
export default interface Extension {
  init(project: Project): void;
}
