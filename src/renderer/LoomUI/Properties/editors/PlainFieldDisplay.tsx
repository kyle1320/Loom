import React from 'react';
import { useFieldValue } from '../../util/hooks';

import './PlainFieldDisplay.scss';
import FieldDisplay from '../../../registry/FieldDisplay';

const PlainFieldDisplay: FieldDisplay = (props: FieldDisplay.Props) => {
  const value = useFieldValue(props.field, props.context);
  const error = value == null;

  return <textarea
    className={'plain-field-display' + (error ? ' error' : '')}
    value={value || ''}
    disabled
    rows={1} />
};

export default PlainFieldDisplay;