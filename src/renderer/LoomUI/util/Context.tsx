import React from 'react';

interface Props<T> {
  context: React.Context<T>;
  children: (ctx: T) => React.ReactNode;
}
export function Consumer<T>(props: Props<T>): React.ReactElement {
  const context = React.useContext(props.context);
  return <>{props.children(context)}</>;
}