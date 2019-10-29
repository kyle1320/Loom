import React from 'react';
import LObject from '../../common/data/objects/LObject';

namespace ObjectEditor {
  export interface Props { object: LObject }
}

type ObjectEditor = React.ComponentType<ObjectEditor.Props>;

export default ObjectEditor;