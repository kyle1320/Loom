import React from 'react';

import FieldList from './FieldList';
import CategoryTabs from './CategoryTabs';
import { useRenderer } from '../RendererContext';
import { Category } from '../../Renderer';
import DataObject from '../../../common/data/objects/DataObject';

import './Properties.scss';

interface Props { context: DataObject | null }

const Properties: React.FC<Props> = (props: Props) => {
  const renderer = useRenderer();
  const [cat, setCat] = React.useState<Category>(
    renderer.getDefaultCategory()
  );

  return <div className="properties">
    <CategoryTabs
      categories={renderer.getCategories()}
      active={cat}
      onSelect={setCat} />
    {props.context
      ? <FieldList context={props.context} category={cat} />
      : 'no object is selected'
    }
  </div>;
}

export default Properties;