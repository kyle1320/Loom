import React from 'react';
import { useRenderer } from '../RendererContext';
import ObjectItem from './ObjectItem';
import DataObject from '../../../common/data/objects/DataObject';

import './Navigator.scss';

interface Props {
  context: DataObject | null;
  onSelect: (obj: DataObject | null) => void;
}

const Navigator: React.FC<Props> = (props: Props) => {
  const renderer = useRenderer()

  return <div className="navigator">
    {
      [...renderer.getProject()!.DataObjects()]
        .map(o => <ObjectItem
          key={o.id}
          object={o}
          onSelect={() => props.onSelect(o)}
          selected={o == props.context} /> )
    }
  </div>;
}

export default Navigator;