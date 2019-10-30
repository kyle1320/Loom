import React from 'react';
import LObject from '../../../../common/data/objects/LObject';
import FieldEditor from '../../../registry/FieldEditor';
import MutableField from '../../../../common/data/fields/MutableField';
import { Manager, manage } from '../../util/imperative';

import './MutableFieldEditor.scss';

function manageContentEditable(field: MutableField, context: LObject): Manager {
  return manage((node: HTMLElement) => {
    function onInput(): void {
      field.set(node.textContent || '');
    }

    // TODO: support links
    node.textContent = field.getAsRawString(context);
    node.addEventListener('input', onInput);
    return () => node.removeEventListener('input', onInput);
  });
}

const MutableFieldEditor: FieldEditor = (props: FieldEditor.Props) => {
  const manager = React.useMemo(
    () => manageContentEditable(props.field, props.context),
    [props.field, props.context]
  );

  return <div
    ref={manager}
    className="basic-field-editor"
    contentEditable ></div>;
}

export default MutableFieldEditor;