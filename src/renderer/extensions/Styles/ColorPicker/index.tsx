import React from 'react';
import {
  FieldEditor,
  FieldEditorProps } from '../../../registry/FieldEditor';

import './ColorPicker.scss';

const ColorPicker: FieldEditor = (props: FieldEditorProps) => {
  const onClick = React.useCallback(() => {
    const col = ['red', 'green', 'blue', 'yellow'][Math.floor(Math.random()*4)];
    props.field.set(col);
  }, [props.field]);
  return <button onClick={onClick}>random</button>
}

export default ColorPicker;