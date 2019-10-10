import Renderer from '../Renderer';

export default interface RendererExtension {
  initRenderer(renderer: Renderer): void;
}