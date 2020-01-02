import React from 'react';
import DBNode from '../../../common/data/db/DBNode';
import { useWatchEvent } from '../util/hooks';

import './NavItem.scss';

interface Props {
  node: DBNode;
  onSelect: (node: DBNode) => void;
}

const NavItem: React.FC<Props> = (props: Props) => {
  useWatchEvent(props.node, 'update');

  const children: React.ReactNode[] = [];
  for (const key in props.node.children) {
    children.push(<NavItem
      key={key}
      node={props.node.children[key]!}
      onSelect={props.onSelect}/>);
  }

  const onClick = React.useCallback(
    () => props.onSelect(props.node),
    [props.onSelect, props.node]
  );

  return <div className="nav-object">
    <div className="nav-object__name" onClick={onClick}>
      {props.node.name}
    </div>
    <div className="nav-object__children">
      {children}
    </div>
  </div>;
}

export default NavItem;