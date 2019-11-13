import React from 'react';
import { useRenderer } from '../RendererContext';
import DataObject from '../../../common/data/objects/DataObject';

import './Editor.scss';
import Properties from './Properties';

interface Props { context: DataObject | null }

const Editor: React.FC<Props> = (props: Props) => {
  const renderer = useRenderer();
  const registry = renderer.registry;
  const ObjectEditor = props.context
    && registry.getObjectEditor(props.context)
    || Properties;

  return <div className="editor">
    { props.context
      ? <ObjectEditor object={props.context!} />
      : 'no object selected' }
  </div>;
}

export default Editor;