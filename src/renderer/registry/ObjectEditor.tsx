import React from 'react';
import DataObject from '../../common/data/objects/DataObject';

namespace ObjectEditor {
  export interface Props { object: DataObject }
}

type ObjectEditor = React.ComponentType<ObjectEditor.Props>;

export default ObjectEditor;