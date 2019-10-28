import React from 'react';
import ObjectEditor from '../../../registry/ObjectEditor';

import './PlainObjectEditor.scss'

const PlainObjectEditor: ObjectEditor = (props: ObjectEditor.Props) => {
  return <div>Editor for {props.object.id}</div>
}

export default PlainObjectEditor;