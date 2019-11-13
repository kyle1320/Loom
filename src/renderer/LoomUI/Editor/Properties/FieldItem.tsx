import React from 'react';

import LObject from '../../../../common/data/objects/LObject';
import DataObject from '../../../../common/data/objects/DataObject';
import MutableField from '../../../../common/data/fields/MutableField';

import { useRenderer } from '../../RendererContext';
import MutableFieldEditor from './editors/MutableFieldEditor';
import IconButton from '../../util/IconButton';

import './FieldItem.scss';

interface Props {
  context: DataObject;
  name: string;
  field: MutableField;
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

  const Type = (!raw && hasEditor)
    ? registry.getFieldEditor(name)!
    : MutableFieldEditor;
  const editor = <Type field={field} context={context} />;

  const canClone = inherited;
  const clone = React.useCallback(
    () => context.addOwnField(name, field.clone()),
    [context, name, field]
  );
  const canDelete = !inherited;
  const del = React.useCallback(
    () => context.removeOwnField(name),
    [name]
  );

  return <div className={className}>
    <div className="property-field__header">
      <div className="property-field__name" title={hoverName}>
        { friendlyName }
      </div>
      { hasEditor &&
        <IconButton
          onClick={toggleRaw as () => void}
          icon={raw ? 'fa-image' : 'fa-code'} /> }
      { canClone &&
        <IconButton icon="fa-clone" className="icon-float"
          onClick={clone} title="Clone" /> }
      { canDelete &&
        <IconButton icon="fa-times" className="icon-float"
          onClick={del} title="Delete" /> }
    </div>
    <div className="property-field__editor">
      {editor}
    </div>
  </div>;
}

export default FieldItem;