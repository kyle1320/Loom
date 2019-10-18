import React from 'react';
import FieldItem from './FieldItem';
import LObject from '../../../common/data/LObject';

import './SubCategory.scss';

interface Props {
  title: string;
  fieldNames: string[];
  context: LObject;
}

const SubCategory: React.FC<Props> = (props: Props) => {
  return props.fieldNames.length
    ? <div className="field-subcategory">
      <div className="field-subcategory__title">{props.title}</div>
      {
        props.fieldNames
          .map(k => <FieldItem
            key={k}
            context={props.context!}
            name={k}
            field={props.context!.getField(k)!} />)
      }
    </div>
    : <></>;
}

export default SubCategory;