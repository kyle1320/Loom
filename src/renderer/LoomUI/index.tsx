import React, { useState } from 'react';
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
        <UIContainer flow="w" size={200} color={color.primary1}
          first={<Navigator context={selected} onSelect={select} />}
          second={<Editor context={selected} />} />
      } />
  </WorkspaceContext.Provider>;
}

export default LoomUI;