import Project from '../data/Project';
import Builder from '../build/Builder';

/* eslint-disable semi */
export default interface DataExtension {
  initProject(project: Project): void;
  initBuilder(builder: Builder): void;
}
