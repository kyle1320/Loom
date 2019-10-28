import React from 'react';
import FieldEditor from '../../../registry/FieldEditor';

import './ColorPicker.scss';
import { useFieldValue } from '../../../LoomUI/util/hooks';

const ColorPicker: FieldEditor = (props: FieldEditor.Props) => {
  const onClick = React.useCallback(() => {
    const col = ['red', 'green', 'blue', 'yellow'][Math.floor(Math.random()*4)];
    props.field.set(col);
  }, [props.field]);
  const color = useFieldValue(props.field, props.context) || '';
  return <button
    onClick={onClick}
    style={{color}}>
      randomize
  </button>;
}

export default ColorPicker;