import React, { useState } from 'react';
import SplitPane from 'react-split-pane';

import Editor from './Editor';
import Navigator from './Navigator';
import WorkspaceContext from './WorkspaceContext';
import Workspace from '../Workspace';
import DataObject from '../../common/data/objects/DataObject';
import * as color from './util/color';
import { ModalProvider } from './util/Modal';

import './LoomUI.scss';

interface Props { workspace: Workspace }

const LoomUI: React.FC<Props> = (props: Props) => {
  const [selected, select] = useState<DataObject | null>(null);

  return <WorkspaceContext.Provider value={props.workspace}>
    <ModalProvider>
      <SplitPane
        split="vertical"
        minSize={150}
        defaultSize={200}
        pane1Style={{ backgroundColor: color.primary1 }} >
        <Navigator context={selected} onSelect={select} />
        <Editor context={selected} />
      </SplitPane>
    </ModalProvider>
  </WorkspaceContext.Provider>;
}

export default LoomUI;