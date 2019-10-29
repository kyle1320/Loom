import React from 'react';

import { Category } from '../../Renderer';
import SubCategory from './SubCategory';
import FieldItem from './FieldItem';
import { useWatchPaths } from '../util/hooks';
import DataObject from '../../../common/data/objects/DataObject';
import Link from '../../../common/data/Link';

import './FieldList.scss';

interface Props {
  context: DataObject;
  category: Category;
}

const FieldList: React.FC<Props> = (props: Props) => {
  useWatchPaths(props.context, props.category.paths);
  const names = ([] as string[]).concat(
    ...props.category.paths.map(
      p => [...new Link(props.context, p).getFieldNames()]
    )
  );
  const unmatchedNames = new Set(names);
  const sections = props.category.sections.map(sec => {
    const fields = [];
    for (const path of sec.paths) {
      const names = [...new Link(props.context, path).getFieldNames()].sort();
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
        field={props.context.fields[k]!} />)
    ]}
  </div>;
}

export default FieldList;