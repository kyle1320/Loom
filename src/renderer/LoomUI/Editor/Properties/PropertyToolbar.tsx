import React from 'react';

import IconButton from '../../util/IconButton';

import './PropertyToolbar.scss';

interface Props {
  showInherited: boolean;
  toggleShowInherited: () => void;
}

const PropertyToolbar: React.FC<Props> = (props: Props) => {
  return <div className="property-toolbar">
    <IconButton
      fa="fas"
      icon="fa-layer-group"
      onClick={props.toggleShowInherited}
      title={`${props.showInherited ? 'Hide' : 'Show'} inherited fields`}
      className={props.showInherited ? 'active toggle' : 'toggle'} />
  </div>;
}

export default PropertyToolbar;