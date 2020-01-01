import React from 'react';
import DataObject from '../../../common/data/objects/DataObject';

import './ObjectItem.scss';

interface Props {
  object: DataObject;
  selected: boolean;
  onSelect: () => void;
}

const ObjectItem: React.FC<Props> = (props: Props) => {
  const className = 'nav-object' + (props.selected ? ' selected' : '');

  return <div className={className} onClick={props.onSelect}>
    {props.object.id}
  </div>;
}

export default ObjectItem;