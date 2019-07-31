import LObject from '../data/LObject';
import Project from '../data/Project';
import EventEmitter from '../util/EventEmitter';
import File from './File';

type BuildStep<T> = (builder: Builder, arg: T) => void;

namespace Builder {
  export type PreBuildStep = BuildStep<void>;
  export type PostBuildStep = BuildStep<void>;
  export type ObjectBuildStep = BuildStep<LObject>;
}

class Builder extends EventEmitter<{
  file: File;
}> {
  private readonly preBuild: Builder.PreBuildStep[] = [];
  private readonly postBuild: Builder.PostBuildStep[] = [];
  private readonly objectBuild: {
    [type: string]: Builder.ObjectBuildStep[];
  } = {};

  public constructor(
    private readonly project: Project
  ) {
    super();
  }

  public addPreBuildStep(step: Builder.PreBuildStep): void {
    this.preBuild.push(step);
  }

  public addPostBuildStep(step: Builder.PostBuildStep): void {
    this.postBuild.push(step);
  }

  public addObjectBuildStep(
    step: Builder.ObjectBuildStep,
    type: string = '*'
  ): void {
    if (type in this.objectBuild) {
      this.objectBuild[type].push(step);
    } else {
      this.objectBuild[type] = [step];
    }
  }

  public build(): void {
    this.preBuild.forEach(b => b(this));

    for (const obj of this.project.allObjects()) {
      this.runAll(this.objectBuild['*'], obj);
      this.runAll(this.objectBuild[obj.type], obj);
    }

    this.postBuild.forEach(b => b(this));
  }

  private runAll<T>(steps: BuildStep<T>[] | undefined, arg: T): void {
    if (steps) steps.forEach(b => b(this, arg));
  }

  public emitFile(file: File): void {
    this.emit('file', file);
  }
}

export default Builder;