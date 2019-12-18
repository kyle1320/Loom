import React from 'react';

import { randomColor } from '../../ColorPicker';
import EditingContext from './EditingContext';

import './EditFrame.scss';

type EditFrame = React.ComponentType;

const EditFrame: EditFrame = () => {
  const ctx = React.useContext(EditingContext.SelectedContext);

  const style: React.CSSProperties = {};
  const bodyStyle: React.CSSProperties = {};

  if (ctx.el) {
    const rect = ctx.el.getBoundingClientRect();
    style.top = rect.top - 11;
    style.left = rect.left - 3;
    style.width = rect.width + 6;
    bodyStyle.height = rect.height + 2;
  } else {
    style.display = 'none';
  }

  const headClick = React.useCallback(
    () => ctx.object?.setOwnField('style.color', randomColor()),
    [ctx.object]
  );

  return <div className="edit-frame" style={style}>
    <div className="edit-frame__head" onClick={headClick} />
    <div className="edit-frame__frame" style={bodyStyle} />
  </div>;
}

export default EditFrame;