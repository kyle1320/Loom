import React from 'react';
import Renderer from '../Renderer';

const RendererContext =
  React.createContext<Renderer>((null as unknown) as Renderer);

export const useRenderer = (): Renderer => React.useContext(RendererContext);

export default RendererContext;