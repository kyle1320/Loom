import React from 'react';
import LObject from '../../../common/data/LObject';
import { useRenderer } from '../RendererContext';
import Field from '../../../common/data/Field';

import './FieldItem.scss';

interface Props {
  context: LObject;
  name: string;
  field: Field;
}

const FieldItem: React.FC<Props> = (props: Props) => {
  const renderer = useRenderer();
  const inherited = !props.context.hasOwnField(props.name);
  const className = 'property-field' + (inherited ? ' inherited' : '');
  const editor = renderer.getRawFieldEditor(props.field, props.context);

  return <div className={className}>
    <div className="property-field__name">
      {props.name + (inherited ? ' (inherited)' : '')}
    </div>
    <div className="property-field__editor">
      {editor}
    </div>
  </div>;
}

export default FieldItem;