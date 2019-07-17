import LObject from "../data/LObject";
import Project from "../data/Project";

type BuildStep<T> = (arg: T) => any;

namespace BuildSystem {
  export type PreBuildStep = BuildStep<void>;
  export type PostBuildStep = BuildStep<void>;
  export type ObjectBuildStep = BuildStep<LObject>;
}

class BuildSystem {
  public static readonly global = new BuildSystem();

  public readonly preBuild: BuildSystem.PreBuildStep[] = [];
  public readonly postBuild: BuildSystem.PostBuildStep[] = [];
  public readonly objectBuild:
    { [type: string]: BuildSystem.ObjectBuildStep[] } = {};

  public addPreBuildStep(step: BuildSystem.PreBuildStep) {
    this.preBuild.push(step);
  }

  public addPostBuildStep(step: BuildSystem.PostBuildStep) {
    this.postBuild.push(step);
  }

  public addObjectBuildStep(
    step: BuildSystem.ObjectBuildStep,
    type: string = '*'
  ) {
    if (type in this.objectBuild)
      this.objectBuild[type].push(step);
    else
      this.objectBuild[type] = [step];
  }

  public build(project: Project) {

    // TODO: what exactly do the build steps modify and how are they managed?
    // e.g. an HTML element for components, an HTML file for pages, etc.

    this.preBuild.forEach(b => b());

    for (let obj of project.objects.all()) {
      this.runAll(this.objectBuild['*'], obj);
      this.runAll(this.objectBuild[obj.type], obj);
    }

    this.postBuild.forEach(b => b());
  }

  private runAll<T>(steps: BuildStep<T>[] | undefined, arg: T) {
    if (steps) steps.forEach(b => b(arg));
  }
}

export default BuildSystem;