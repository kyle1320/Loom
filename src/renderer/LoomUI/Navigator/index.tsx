import React from 'react';
import DataObject from '../../../common/data/objects/DataObject';
import NavTree from './NavTree';
import NavigatorToolbar from './NavigatorToolbar';

import './Navigator.scss';

interface Props {
  context: DataObject | null;
  onSelect: (obj: DataObject | null) => void;
}

const Navigator: React.FC<Props> = ({ context, onSelect }: Props) => {
  return <div className="navigator">
    <NavigatorToolbar></NavigatorToolbar>
    <NavTree context={context} onSelect={onSelect}></NavTree>
  </div>;
}

export default Navigator;