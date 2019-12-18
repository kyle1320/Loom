import React from 'react';

import './ColorPicker.scss';
import { Widget, WidgetProps } from '.';
import IconButton from '../../../../../LoomUI/util/IconButton';
import { randomColor } from '../../../ColorPicker';

const ColorPicker: Widget = (props: WidgetProps) => {
  const randomizeColor = React.useCallback(() => {
    props.object?.setOwnField('style.color', randomColor());
  }, [props.object]);

  return <IconButton icon="fa-palette" onClick={randomizeColor} />
}

export default ColorPicker;