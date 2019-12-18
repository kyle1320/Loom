import React from 'react';

import './Floating.scss';

type Props = { children: React.ReactNode };
type Floating = React.ComponentType<Props>;

const Floating: Floating = (props: Props) => {
  return <div className="floating__container">
    <div className="floating">
      {props.children}
    </div>
  </div>;
}

export default Floating;