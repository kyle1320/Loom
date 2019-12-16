import React from 'react';
import FieldEditor from '../../../registry/FieldEditor';

import './ColorPicker.scss';
import { useFieldValue } from '../../../LoomUI/util/hooks';

export function randomColor(): string {
  return [
    'red', 'green', 'blue', 'yellow', 'orange', 'magenta'
  ][Math.floor(Math.random()*6)];
}

const ColorPicker: FieldEditor = (props: FieldEditor.Props) => {
  const onClick = React.useCallback(() => {
    const col = randomColor();
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