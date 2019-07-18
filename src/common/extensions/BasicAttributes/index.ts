import Project from "../../data/Project";
import BasicAttribute from "./BasicAttribute";

export default class BasicAttributeExtension {
  init(project: Project) {
    project.addAttributeType(BasicAttribute);
  }
}