import React from 'react';

import FieldList from './FieldList';
import PropertyToolbar from './PropertyToolbar';
import ObjectEditor from '../../../registry/ObjectEditor';

import './Properties.scss';

const Properties: ObjectEditor = (props: ObjectEditor.Props) => {
  const [showInherited, toggleShowInherited] = React.useReducer(
    i => !i,
    false
  );

  return <div className="properties">
    <PropertyToolbar
      showInherited={showInherited}
      toggleShowInherited={toggleShowInherited as () => void} />
    {props.object
      ? <FieldList
        showInherited={showInherited}
        context={props.object} />
      : 'no object is selected'
    }
  </div>;
}

export default Properties;