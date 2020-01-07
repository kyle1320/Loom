import React from 'react';

import FieldList from './FieldList';
import PropertyToolbar from './PropertyToolbar';
import ObjectEditor from '../../../registry/ObjectEditor';
import { useToggle } from '../../util/hooks';

import './Properties.scss';

const Properties: ObjectEditor = (props: ObjectEditor.Props) => {
  const [showInherited, toggleShowInherited] = useToggle(false);

  return <div className="properties">
    <PropertyToolbar
      showInherited={showInherited}
      toggleShowInherited={toggleShowInherited} />
    <FieldList
      showInherited={showInherited}
      context={props.object} />
  </div>;
}

export default Properties;