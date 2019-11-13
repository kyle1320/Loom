import React from 'react';
import Workspace from '../Workspace';

const WorkspaceContext =
  React.createContext<Workspace>((null as unknown) as Workspace);

export const useWorkspace = (): Workspace => React.useContext(WorkspaceContext);

export default WorkspaceContext;