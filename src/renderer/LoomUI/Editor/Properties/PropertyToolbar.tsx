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
      className={props.showInherited ? 'active' : ''} />
  </div>;
}

export default PropertyToolbar;