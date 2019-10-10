import React from 'react';
import LObject from '../../../common/data/LObject';

import './ObjectItem.scss';

interface Props {
  object: LObject;
  selected: boolean;
  onSelect: () => void;
}

const ObjectItem: React.FC<Props> = (props: Props) => {
  const className = 'nav-object' + (props.selected ? ' selected' : '');

  return <div className={className} onClick={props.onSelect}>
    {props.object.type} {props.object.id} : {props.object.getPath()}
  </div>;
}

export default ObjectItem;