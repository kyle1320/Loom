import React from 'react';
import { useProject } from '../WorkspaceContext';
import NavItem from './NavItem';
import DataObject from '../../../common/data/objects/DataObject';
import DBNode from '../../../common/data/db/DBNode';

import './Navigator.scss';

interface Props {
  context: DataObject | null;
  onSelect: (obj: DataObject | null) => void;
}

const Navigator: React.FC<Props> = (props: Props) => {
  const project = useProject()!;

  return <div className="navigator">
    {
      <NavItem
        node={project.db.getNodeAtPath('')!}
        onSelect={
          React.useCallback(
            (n: DBNode) => props.onSelect(n.item || null),
            [props.onSelect]
          )
        } />
    }
  </div>;
}

export default Navigator;