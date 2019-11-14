import React from 'react';

import Workspace from '../Workspace';
import UIRegistry from '../registry/UIRegistry';
import Project from '../../common/data/Project';

const WorkspaceContext =
  React.createContext<Workspace>((null as unknown) as Workspace);

export const useWorkspace = (): Workspace => React.useContext(WorkspaceContext);
export const useRegistry = (): UIRegistry => useWorkspace().registry;
export const useProject = (): Project | null => useWorkspace().getProject();

export default WorkspaceContext;