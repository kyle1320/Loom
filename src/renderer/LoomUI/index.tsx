import React, { useState } from 'react';
import SplitPane from 'react-split-pane';

import Editor from './Editor';
import Toolbar from './Toolbar';
import Navigator from './Navigator';
import WorkspaceContext from './WorkspaceContext';
import Workspace from '../Workspace';
import DataObject from '../../common/data/objects/DataObject';
import UIContainer from './util/UIContainer';
import * as color from './util/color';

import './LoomUI.scss';

interface Props { workspace: Workspace }

const LoomUI: React.FC<Props> = (props: Props) => {
  const [selected, select] = useState<DataObject | null>(null);

  return <WorkspaceContext.Provider value={props.workspace}>
    <UIContainer flow="n" size={30} color={color.primary3}
      first={<Toolbar context={selected} />}
      second={
        <SplitPane
          split="vertical"
          minSize={100}
          defaultSize={200}
          pane1Style={{ backgroundColor: color.primary1 }} >
          <Navigator context={selected} onSelect={select} />
          <Editor context={selected} />
        </SplitPane>
      } />
  </WorkspaceContext.Provider>;
}

export default LoomUI;