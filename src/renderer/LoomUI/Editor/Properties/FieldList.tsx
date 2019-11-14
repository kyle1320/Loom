import React from 'react';

import Category from './Category';
import { useWatchLink } from '../../util/hooks';
import DataObject from '../../../../common/data/objects/DataObject';
import Link from '../../../../common/data/Link';

import './FieldList.scss';
import LObject from '../../../../common/data/objects/LObject';
import { useRegistry } from '../../WorkspaceContext';

interface Props {
  context: DataObject;
  showInherited: boolean;
}

const FieldList: React.FC<Props> = (props: Props) => {
  const registry = useRegistry();
  const categories = registry.getCategories();
  const all = Link.to(props.context, '*');

  useWatchLink(all);
  const names = [...all.getFieldNames()]
    .filter(k => props.showInherited || LObject.hasOwnField(props.context, k));
  const unmatchedNames = new Set(names);
  const cats = categories.map(cat => {
    const fields = [];
    for (const path of cat.paths) {
      const names = [...Link.to(props.context, path).getFieldNames()].sort();
      for (const name of names) {
        if (unmatchedNames.has(name)) {
          unmatchedNames.delete(name);
          fields.push(name);
        }
      }
    }
    return {
      title: cat.name,
      fieldNames: fields
    };
  });

  return <div className="field-list">
    {
      cats.map(x => <Category
        key={x.title}
        context={props.context}
        {...x} />)
    }
  </div>;
}

export default FieldList;