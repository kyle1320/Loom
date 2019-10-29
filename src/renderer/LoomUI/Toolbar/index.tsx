import React from 'react';
import LObject from '../../../common/data/objects/LObject';

import './Toolbar.scss';

interface Props { context: LObject | null }

const Toolbar: React.FC<Props> = (props: Props) => {
  return <div className="toolbar">
    Toolbar for {props.context && props.context.id}
  </div>;
}

export default Toolbar;