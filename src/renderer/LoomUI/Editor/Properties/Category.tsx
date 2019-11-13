import React from 'react';

import FieldItem from './FieldItem';
import DataObject from '../../../../common/data/objects/DataObject';

import './Category.scss';

interface Props {
  title: string;
  fieldNames: string[];
  context: DataObject;
}

const Category: React.FC<Props> = (props: Props) => {
  return props.fieldNames.length
    ? <div className="field-category">
      <div className="field-category__title">{props.title}</div>
      {
        props.fieldNames
          .map(k => <FieldItem
            key={k}
            context={props.context!}
            name={k}
            field={props.context!.fields[k]!} />)
      }
    </div>
    : <></>;
}

export default Category;