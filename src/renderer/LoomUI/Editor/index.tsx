import React from 'react';
import { useRegistry } from '../WorkspaceContext';
import DataObject from '../../../common/data/objects/DataObject';

import './Editor.scss';
import Properties from './Properties';
import ObjectEditor from '../../registry/ObjectEditor';

interface Props { context: DataObject | null }

const NoObjectEditor: ObjectEditor = () => {
  return <div className="no-object-editor">
    <div className="heading">No Object Selected</div>
    <div className="subtitle">Select an object to view / edit</div>
  </div>;
}

const Editor: React.FC<Props> = (props: Props) => {
  const registry = useRegistry();
  const ObjectEditor = props.context
    ? registry.getObjectEditor(props.context) || Properties
    : NoObjectEditor;

  return <div className="editor">
    <ObjectEditor object={props.context!} />
  </div>;
}

export default Editor;