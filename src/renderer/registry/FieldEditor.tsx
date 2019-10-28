import React from 'react';
import LObject from '../../common/data/LObject';
import MutableField from '../../common/data/MutableField';

namespace FieldEditor {
  export interface Props { field: MutableField; context: LObject }
}

type FieldEditor = React.ComponentType<FieldEditor.Props>;

export default FieldEditor;