import React from 'react';
import LObject from '../../common/data/LObject';
import Field from '../../common/data/Field';

namespace FieldDisplay {
  export interface Props { field: Field; context: LObject }
}

type FieldDisplay = React.ComponentType<FieldDisplay.Props>;

export default FieldDisplay;