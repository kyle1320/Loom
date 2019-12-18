import React from 'react';

import EditingContext from './EditingContext';

import './EditFrame.scss';
import ColorPicker from './Widgets/ColorPicker';

type EditFrame = React.ComponentType;

const EditFrame: EditFrame = () => {
  const ctx = React.useContext(EditingContext.SelectedContext);

  const style: React.CSSProperties = {};
  const bodyStyle: React.CSSProperties = {};

  if (ctx.el) {
    const rect = ctx.el.getBoundingClientRect();
    style.top = rect.top - 1;
    style.left = rect.left - 3;
    style.width = rect.width + 6;
    bodyStyle.height = rect.height + 2;
  } else {
    style.display = 'none';
  }

  return <div className="edit-frame" style={style}>
    <div className="edit-frame__head" >
      <ColorPicker object={ctx.object} />
    </div>
    <div className="edit-frame__frame" style={bodyStyle} />
  </div>;
}

export default EditFrame;