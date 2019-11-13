import React from 'react';

import './UIContainer.scss';

interface PanelProps {
  control: boolean;
  size?: number;
  direction: 'v' | 'h';
  color?: string;
  className?: string;
  children: React.ReactElement;
}

const UIPanel: React.FC<PanelProps> = (props: PanelProps) => {
  const style: React.CSSProperties = {};

  if (props.size) {
    if (props.direction === 'v') style.height = props.size + 'px';
    else style.width = props.size + 'px';
  }
  if (props.color) {
    style.backgroundColor = props.color;
  }

  const panelClass = 'ui-panel ' + (props.control
    ? 'ui-panel-control'
    : 'ui-panel-passive');
  const className = props.className
    ? props.className + ' ' + panelClass
    : panelClass;

  return <div
    className={className}
    style={style}>
    {props.children}
  </div>;
}

interface ContainerProps {
  flow: 'n' | 'e' | 's' | 'w';
  size: number;
  first: React.ReactElement;
  second: React.ReactElement;
  className?: string;
  firstClassName?: string;
  secondClassName?: string;
  color?: string;
}

const UIContainer: React.FC<ContainerProps> = (props: ContainerProps) => {
  const controlFirst = props.flow === 'n' || props.flow === 'w';
  const dir = props.flow === 'n' || props.flow === 's' ? 'v' : 'h';

  const controlPanel = <UIPanel
    direction={dir}
    control={true}
    size={props.size}
    color={props.color}
    className={controlFirst ? props.firstClassName : props.secondClassName}>
    {controlFirst ? props.first : props.second}

  </UIPanel>;
  const nonControlPanel = <UIPanel
    direction={dir}
    control={false}
    className={controlFirst ? props.secondClassName : props.firstClassName}>
    {controlFirst ? props.second : props.first}
  </UIPanel>;

  const containerClass = 'ui-container ui-container-' + props.flow;
  const className = props.className
    ? props.className + ' ' + containerClass
    : containerClass;

  return <div className={className}>
    {controlFirst
      ? [controlPanel, nonControlPanel]
      : [nonControlPanel, controlPanel]}
  </div>;
}

export default UIContainer;