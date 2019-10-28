import React from 'react';
import LObject from '../../common/data/LObject';
import BasicField from '../../common/data/BasicField';

namespace FieldEditor {
  export interface Props { field: BasicField; context: LObject }
}

type FieldEditor = React.ComponentType<FieldEditor.Props>;

export default FieldEditor;