import Project from "../../data/Project";
import BasicField from "./BasicField";

export default class BasicFieldExtension {
  init(project: Project) {
    project.addFieldType(BasicField);
  }
}