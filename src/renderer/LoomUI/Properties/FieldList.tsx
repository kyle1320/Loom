import React from 'react';
import LObject from '../../../common/data/LObject';
import FieldItem from './FieldItem';
import { Category } from '../../Renderer';

import './FieldList.scss';

interface Props {
  context: LObject | null;
  category: Category;
}

const FieldList: React.FC<Props> = (props: Props) => {
  return <div className="field-list">
    {
      (props.context && [...props.context.getFieldNames(props.category.path)]
        .map(k => <FieldItem
          key={k}
          context={props.context!}
          name={k}
          field={props.context!.getField(k)!} />)) || 'no object is selected'
    }
  </div>;
}

export default FieldList;