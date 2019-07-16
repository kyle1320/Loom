import LObject from "../data/LObject";
import Attribute from "../data/Attribute";
import Project from "../data/Project";

type BuildStep<T> = (arg: T) => any;

namespace BuildSystem {
  export type PreBuildStep = BuildStep<void>;
  export type PostBuildStep = BuildStep<void>;
  export type PreObjectBuildStep = BuildStep<LObject>;
  export type PostObjectBuildStep = BuildStep<LObject>;
  export type AttributeBuildStep = BuildStep<Attribute>;
}

class BuildSystem {
  public static readonly global = new BuildSystem();

  public readonly preBuild: BuildSystem.PreBuildStep[] = [];
  public readonly postBuild: BuildSystem.PostBuildStep[] = [];
  public readonly preObjectBuild:
    { [type: string]: BuildSystem.PreObjectBuildStep[] } = {};
  public readonly postObjectBuild:
    { [type: string]: BuildSystem.PostObjectBuildStep[] } = {};
  public readonly attributeBuild:
    { [key: string]: BuildSystem.AttributeBuildStep[] } = {};

  public addPreBuildStep(step: BuildSystem.PreBuildStep) {
    this.preBuild.push(step);
  }

  public addPostBuildStep(step: BuildSystem.PostBuildStep) {
    this.postBuild.push(step);
  }

  public addPreObjectBuildStep(
    step: BuildSystem.PreObjectBuildStep,
    type: string = '*'
  ) {
    if (type in this.preObjectBuild)
      this.preObjectBuild[type].push(step);
    else
      this.preObjectBuild[type] = [step];
  }

  public addPostObjectBuildStep(
    step: BuildSystem.PostObjectBuildStep,
    type: string = '*'
  ) {
    if (type in this.postObjectBuild)
      this.postObjectBuild[type].push(step);
    else
      this.postObjectBuild[type] = [step];
  }

  public addAttributeBuildStep(
    step: BuildSystem.AttributeBuildStep,
    key: string = '*'
  ) {
    if (key in this.attributeBuild)
      this.attributeBuild[key].push(step);
    else
      this.attributeBuild[key] = [step];
  }

  public build(project: Project) {

    // TODO: what exactly do the build steps modify and how are they managed?
    // e.g. an HTML element for components, an HTML file for pages, etc.

    this.preBuild.forEach(b => b());

    for (let obj of project.objects.all()) {
      this.runAll(this.preObjectBuild['*'], obj);
      this.runAll(this.preObjectBuild[obj.type], obj);

      for (let attr of obj.getAttributes()) {
        this.runAll(this.attributeBuild['*'], attr);
        this.runAll(this.attributeBuild[attr.key], attr);
      }

      this.runAll(this.postObjectBuild['*'], obj);
      this.runAll(this.postObjectBuild[obj.type], obj);
    }

    this.postBuild.forEach(b => b());
  }

  private runAll<T>(steps: BuildStep<T>[] | undefined, arg: T) {
    if (steps) steps.forEach(b => b(arg));
  }
}

export default BuildSystem;