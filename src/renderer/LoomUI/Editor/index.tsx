import React from 'react';
import LObject from '../../../common/data/LObject';
import { useRenderer } from '../RendererContext';

import './Editor.scss';

interface Props { context: LObject | null }

const Editor: React.FC<Props> = (props: Props) => {
  const renderer = useRenderer();
  const ObjectEditor = props.context && renderer.getObjectEditor(props.context);

  return <div className="editor">
    {ObjectEditor || 'no object selected'}
  </div>;
}

export default Editor;