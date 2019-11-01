import React from 'react';
import LObject from '../../../common/data/objects/LObject';
import { useRenderer } from '../RendererContext';

import './Editor.scss';

interface Props { context: LObject | null }

const Editor: React.FC<Props> = (props: Props) => {
  const renderer = useRenderer();
  const registry = renderer.registry;
  const ObjectEditor = props.context && registry.getObjectEditor(props.context);

  return <div className="editor">
    { ObjectEditor
      ? <ObjectEditor object={props.context!} />
      : 'no object selected' }
  </div>;
}

export default Editor;