import Project from "../data/Project";

export default interface Extension {
  init(project: Project): void;
}