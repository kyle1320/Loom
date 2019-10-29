import React from 'react';
import MutableField from '../../common/data/fields/MutableField';
import DataObject from '../../common/data/objects/DataObject';

namespace FieldEditor {
  export interface Props { field: MutableField; context: DataObject }
}

type FieldEditor = React.ComponentType<FieldEditor.Props>;

export default FieldEditor;