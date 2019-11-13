import React from 'react';

import './IconButton.scss';

interface KProps {
  icon: string;
  fa?: string;
  onClick: () => unknown;
  disabled?: boolean;
}
type Props = KProps & React.HTMLAttributes<HTMLDivElement>

const IconButton: React.FC<Props> = (props: Props) => {
  const { className, icon, fa, disabled, ...otherProps } = props;

  let className2 = (
    className ? className + ' ' : ''
  ) + `icon-btn ${fa || 'fa'} ${icon}`;

  if (disabled) className2 += ' disabled';

  return <div className={className2} {...otherProps} />;
}

export default IconButton;