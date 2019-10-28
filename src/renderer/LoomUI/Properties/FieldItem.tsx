import React from 'react';
import Field from '../../../common/data/Field';
import LObject from '../../../common/data/LObject';
import MutableField from '../../../common/data/MutableField';
import { useRenderer } from '../RendererContext';

import './FieldItem.scss';

interface Props {
  context: LObject;
  name: string;
  field: Field;
}

const FieldItem: React.FC<Props> = (props: Props) => {
  const renderer = useRenderer();
  const inherited = !props.context.hasOwnField(props.name);

  const friendlyName = renderer.getFieldName(props.name) || props.name;
  const hoverName = props.name + (inherited ? ' (inherited)' : '');

  const className = 'property-field' + (inherited ? ' inherited' : '');

  const isEditable = props.field instanceof MutableField;
  const hasEditor = isEditable && renderer.hasFieldEditor(props.name);
  const [raw, toggleRaw] = React.useReducer(
    x => !hasEditor || !x,
    !hasEditor,
  );

  const editor = props.field instanceof MutableField
    ? (!raw && hasEditor)
      ? renderer.getFieldEditor(props.name, props.field, props.context)
      : renderer.getRawFieldEditor(props.field, props.context)
    : renderer.getFieldDisplay(props.field, props.context);

  const clone = React.useCallback(
    () => props.context.addOwnField(props.name, props.field.clone()),
    [props.context, props.name, props.field]
  );
  const del = React.useCallback(
    () => props.context.removeOwnField(props.name),
    [props.name]
  );

  return <div className={className}>
    <div className="property-field__header">
      <div className="property-field__name" title={hoverName}>
        {friendlyName}
      </div>
      { hasEditor && <button onClick={toggleRaw}>{raw ? 'e' : 'r'}</button> }
      <button onClick={clone} disabled={!inherited}>+</button>
      <button onClick={del} disabled={inherited}>x</button>
    </div>
    <div className="property-field__editor">
      {editor}
    </div>
  </div>;
}

export default FieldItem;