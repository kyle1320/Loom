import React from 'react';
import { useProject } from '../WorkspaceContext';
import ObjectItem from './ObjectItem';
import DataObject from '../../../common/data/objects/DataObject';

import './Navigator.scss';

interface Props {
  context: DataObject | null;
  onSelect: (obj: DataObject | null) => void;
}

const Navigator: React.FC<Props> = (props: Props) => {
  const project = useProject()!;

  return <div className="navigator">
    {
      [...project.DataObjects()]
        .map(o => <ObjectItem
          key={o.id}
          object={o}
          onSelect={() => props.onSelect(o)}
          selected={o == props.context} /> )
    }
  </div>;
}

export default Navigator;