import React, { useState } from 'react';
import Editor from './Editor';
import Toolbar from './Toolbar';
import Navigator from './Navigator';
import RendererContext from './RendererContext';
import Renderer from '../Renderer';
import DataObject from '../../common/data/objects/DataObject';
import UIContainer from './util/UIContainer';
import * as color from './util/color';

import './LoomUI.scss';

interface Props { renderer: Renderer }

const LoomUI: React.FC<Props> = (props: Props) => {
  const [selected, select] = useState<DataObject | null>(null);

  return <RendererContext.Provider value={props.renderer}>
    <UIContainer flow="n" size={30} color={color.primary3}
      first={<Toolbar context={selected} />}
      second={
        <UIContainer flow="w" size={200} color={color.primary1}
          first={<Navigator context={selected} onSelect={select} />}
          second={<Editor context={selected} />} />
      } />
  </RendererContext.Provider>;
}

export default LoomUI;