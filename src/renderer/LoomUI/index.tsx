import React, { useState } from 'react';
import Editor from './Editor';
import Toolbar from './Toolbar';
import Navigator from './Navigator';
import Properties from './Properties';
import RendererContext from './RendererContext';
import Renderer from '../Renderer';
import LObject from '../../common/data/LObject';

import './LoomUI.scss';

interface Props { renderer: Renderer }

const LoomUI: React.FC<Props> = (props: Props) => {
  const [selected, select] = useState<LObject | null>(null);

  return <RendererContext.Provider value={props.renderer}>
    <div className="loom-ui">
      <Toolbar context={selected} />
      <div className="center">
        <Navigator context={selected} onSelect={select} />
        <Editor context={selected} />
        <Properties context={selected} />
      </div>
    </div>
  </RendererContext.Provider>;
}

export default LoomUI;