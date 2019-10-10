import React from 'react';
import Field from '../../common/data/Field';
import LObject from '../../common/data/LObject';

import './FieldEditor.scss';
import { useFieldValue } from '../LoomUI/util/hooks';

export interface FieldEditorProps { field: Field; context: LObject }
export type FieldEditor = React.ComponentType<FieldEditorProps>;

export const PlainFieldEditor: FieldEditor = (props: FieldEditorProps) => {
  const onChange = React.useCallback(
    (e: React.FormEvent<HTMLInputElement>) =>
      props.field.set(e.currentTarget.value),
    [props.field]
  );

  const value = useFieldValue(
    props.field,
    props.context,
    (field, context) => field.get(context)
  );
  const error = value == null;

  return <input
    className={'plain-field-editor' + (error ? ' error' : '')}
    type="text"
    onChange={onChange}
    value={value || ''}
    disabled={error || !props.field.writable} />
};