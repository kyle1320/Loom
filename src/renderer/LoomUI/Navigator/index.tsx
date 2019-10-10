import React from 'react';
import LObject from '../../../common/data/LObject';

import './Navigator.scss';
import { useRenderer } from '../RendererContext';
import ObjectItem from './ObjectItem';

interface Props {
  context: LObject | null;
  onSelect: (obj: LObject | null) => void;
}

const Navigator: React.FC<Props> = (props: Props) => {
  const renderer = useRenderer()

  return <div className="navigator">
    {
      [...renderer.getProject()!.allObjects()]
        .map(o => <ObjectItem
          key={o.id}
          object={o}
          onSelect={() => props.onSelect(o)}
          selected={o == props.context} /> )
    }
  </div>;
}

export default Navigator;