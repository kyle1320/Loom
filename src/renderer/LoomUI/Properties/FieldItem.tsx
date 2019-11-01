import React from 'react';

import Field from '../../../common/data/fields/Field';
import LObject from '../../../common/data/objects/LObject';
import DataObject from '../../../common/data/objects/DataObject';
import MutableField from '../../../common/data/fields/MutableField';

import { useRenderer } from '../RendererContext';
import MutableFieldEditor from './editors/MutableFieldEditor';
import PlainFieldDisplay from './editors/PlainFieldDisplay';

import './FieldItem.scss';

interface Props {
  context: DataObject;
  name: string;
  field: Field;
}

const FieldItem: React.FC<Props> = ({ context, field, name }: Props) => {
  const renderer = useRenderer();
  const registry = renderer.registry;
  const inherited = !LObject.hasOwnField(context, name);

  const friendlyName = renderer.getFieldName(name) || name;
  const hoverName = name + (inherited ? ' (inherited)' : '');

  const className = 'property-field' + (inherited ? ' inherited' : '');

  const isEditable = field instanceof MutableField;
  const hasEditor = isEditable && !!registry.getFieldEditor(name);
  const [raw, toggleRaw] = React.useReducer(
    x => !hasEditor || !x,
    !hasEditor,
  );

  let editor: React.ReactElement;
  if (field instanceof MutableField) {
    const Type = (!raw && hasEditor)
      ? registry.getFieldEditor(name)!
      : MutableFieldEditor;
    editor = <Type field={field} context={context} />;
  } else {
    const Type = registry.getFieldDisplay(field) || PlainFieldDisplay;
    editor = <Type field={field} context={context} />;
  }

  const canClone = field instanceof MutableField;
  const clone = React.useCallback(
    () => field instanceof MutableField
      && context.addOwnField(name, field.clone()),
    [context, name, field]
  );
  const canDelete = field instanceof MutableField;
  const del = React.useCallback(
    () => context.removeOwnField(name),
    [name]
  );

  return <div className={className}>
    <div className="property-field__header">
      <div className="property-field__name" title={hoverName}>
        {friendlyName}
      </div>
      { hasEditor && <button onClick={toggleRaw}>{raw ? 'e' : 'r'}</button> }
      { canClone && <button onClick={clone} disabled={!inherited}>+</button> }
      { canDelete && <button onClick={del} disabled={inherited}>x</button> }
    </div>
    <div className="property-field__editor">
      {editor}
    </div>
  </div>;
}

export default FieldItem;