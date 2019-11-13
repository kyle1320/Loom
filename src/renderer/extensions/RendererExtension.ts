import Workspace from '../Workspace';

export default interface RendererExtension {
  initWorkspace?(workspace: Workspace): void;
}