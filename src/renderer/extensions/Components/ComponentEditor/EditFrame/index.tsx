import React from 'react';
import DataObject from '../../../../../common/data/objects/DataObject';
import { randomColor } from '../../ColorPicker';


type EditFrameProps =
  { object: DataObject; el: HTMLElement } |
  { object: null; el: null }
type EditFrame = React.ComponentType<EditFrameProps>;

const EditFrame: EditFrame = (props: EditFrameProps) => {
  const style: React.CSSProperties = {
    position: 'absolute',
    pointerEvents: 'none'
  };
  const headerStyle: React.CSSProperties = {
    pointerEvents: 'auto',
    height: '10px',
    backgroundColor: '#8AF'
  };
  const bodyStyle: React.CSSProperties = {
    border: '2px dashed #8AF',
    borderTop: ''
  };

  if (props.el) {
    const rect = props.el.getBoundingClientRect();
    style.top = rect.top - 11;
    style.left = rect.left - 3;
    style.width = rect.width + 6;
    bodyStyle.height = rect.height + 2;
  } else {
    style.display = 'none';
  }

  const headClick = React.useCallback(
    () => props.object?.addOwnField('style.color', randomColor()),
    [props.object]
  );

  return <div style={style}>
    <div style={headerStyle} onClick={headClick} />
    <div style={bodyStyle} />
  </div>;
}

export default EditFrame;