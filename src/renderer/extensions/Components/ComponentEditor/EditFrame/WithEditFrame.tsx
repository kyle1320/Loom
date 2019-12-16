import React from 'react';
import EditFrame from '.';
import { Manager } from '../../../../LoomUI/util/imperative';
import DataObject from '../../../../../common/data/objects/DataObject';

type Props = {
  children: React.ReactNode;
};
type State =
  { object: DataObject; el: HTMLElement } |
  { object: null; el: null };

type ReactAttrs =
  React.ClassAttributes<HTMLElement> &
  React.DOMAttributes<HTMLElement> & {
    ref: Manager;
  };
export type PropGetter = (link: DataObject) => ReactAttrs;
export const EditFrameContext = React.createContext<PropGetter>(null!);

export default class WithEditFrame extends React.Component<Props, State> {
  public constructor(props: Props) {
    super(props);
    this.state = {
      object: null,
      el: null
    };
  }

  private getComponentProps = (link: DataObject): ReactAttrs =>
  {
    let node: HTMLElement | null = null;
    const res: ReactAttrs = {
      ref: (n: HTMLElement | null) => { node = n; },
      onMouseOver: React.useCallback(
        (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
          e.stopPropagation();
          this.setState({
            object: link,
            el: node
          })
        }, [link])
    };

    return res;
  }

  public render(): JSX.Element {
    return <>
      <EditFrameContext.Provider value={this.getComponentProps}>
        {this.props.children}
      </EditFrameContext.Provider>
      <EditFrame {...this.state} />
    </>;
  }
}