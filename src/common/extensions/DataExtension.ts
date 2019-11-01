import Project from '../data/Project';

/* eslint-disable semi */
export default interface DataExtension {
  initProject?(project: Project): void;
}
