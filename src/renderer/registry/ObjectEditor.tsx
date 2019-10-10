import React from 'react';
import LObject from '../../common/data/LObject';

import './ObjectEditor.scss';

export interface ObjectEditorProps { object: LObject }
export type ObjectEditor = React.ComponentType<ObjectEditorProps>;

export const PlainObjectEditor: ObjectEditor = (props: ObjectEditorProps) => {
  return <div>Editor for {props.object.id}</div>
}