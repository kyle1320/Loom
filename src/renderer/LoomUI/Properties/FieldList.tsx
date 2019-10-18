import React from 'react';
import LObject from '../../../common/data/LObject';
import { Category } from '../../Renderer';
import SubCategory from './SubCategory';

import './FieldList.scss';
import FieldItem from './FieldItem';
import { useWatchPaths } from '../util/hooks';

interface Props {
  context: LObject;
  category: Category;
}

const FieldList: React.FC<Props> = (props: Props) => {
  useWatchPaths(props.context, props.category.paths);
  const names = ([] as string[]).concat(
    ...props.category.paths.map(p => [...props.context.getFieldNames(p)])
  );
  const unmatchedNames = new Set(names);
  const sections = props.category.sections.map(sec => {
    const fields = [];
    for (const path of sec.paths) {
      const names = [...props.context.getLink(path).getFieldNames()].sort();
      for (const name of names) {
        unmatchedNames.delete(name);
        fields.push(name);
      }
    }
    return {
      title: sec.name,
      fieldNames: fields
    };
  });

  return <div className="field-list">
    {[
      sections.map(x => <SubCategory
        key={x.title}
        context={props.context}
        {...x} />),
      [...unmatchedNames].map(k => <FieldItem
        key={k}
        context={props.context}
        name={k}
        field={props.context.getField(k)!} />)
    ]}
  </div>;
}

export default FieldList;