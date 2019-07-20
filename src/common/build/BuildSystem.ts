import LObject from '../data/LObject';
import Project from '../data/Project';

type BuildStep<T> = (arg: T) => void;

namespace BuildSystem {
  export type PreBuildStep = BuildStep<void>;
  export type PostBuildStep = BuildStep<void>;
  export type ObjectBuildStep = BuildStep<LObject>;
}

class BuildSystem {
  public static readonly global = new BuildSystem();

  public readonly preBuild: BuildSystem.PreBuildStep[] = [];
  public readonly postBuild: BuildSystem.PostBuildStep[] = [];
  public readonly objectBuild: {
    [type: string]: BuildSystem.ObjectBuildStep[];
  } = {};

  public addPreBuildStep(step: BuildSystem.PreBuildStep): void {
    this.preBuild.push(step);
  }

  public addPostBuildStep(step: BuildSystem.PostBuildStep): void {
    this.postBuild.push(step);
  }

  public addObjectBuildStep(
    step: BuildSystem.ObjectBuildStep,
    type: string = '*'
  ): void {
    if (type in this.objectBuild) {
      this.objectBuild[type].push(step);
    } else {
      this.objectBuild[type] = [step];
    }
  }

  public build(project: Project): void {

    // TODO: what exactly do the build steps modify and how are they managed?
    // e.g. an HTML element for components, an HTML file for pages, etc.

    this.preBuild.forEach(b => b());

    for (const obj of project.allObjects()) {
      this.runAll(this.objectBuild['*'], obj);
      this.runAll(this.objectBuild[obj.type], obj);
    }

    this.postBuild.forEach(b => b());
  }

  private runAll<T>(steps: BuildStep<T>[] | undefined, arg: T): void {
    if (steps) steps.forEach(b => b(arg));
  }
}

export default BuildSystem;