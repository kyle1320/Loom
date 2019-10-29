import React from 'react';
import { Category } from '../../Renderer';

import './CategoryTabs.scss';

interface Props {
  categories: Category[];
  active: Category | null;
  onSelect: (cat: Category) => void;
}

const CategoryTabs: React.FC<Props> = (props: Props) => {
  return <div className="field-categories">
    {
      props.categories
        .map(c => <div
          className={'category' +
            (props.active && props.active.key == c.key ? ' active' : '')
          }
          key={c.key}
          onClick={() => props.onSelect(c)}>
          {c.name}
        </div>)
    }
  </div>;
}

export default CategoryTabs;