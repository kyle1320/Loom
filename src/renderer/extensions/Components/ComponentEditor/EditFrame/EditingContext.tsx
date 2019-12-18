import React from 'react';

import { Manager } from '../../../../LoomUI/util/imperative';
import DataObject from '../../../../../common/data/objects/DataObject';

namespace EditingContext {
  type ReactAttrs =
    React.ClassAttributes<HTMLElement> &
    React.DOMAttributes<HTMLElement> & {
      ref: Manager;
    };
  export type PropGetter = (link: DataObject) => ReactAttrs;
  export const PropGetterContext = React.createContext<PropGetter>(null!);

  export type Selected =
    { object: DataObject; el: HTMLElement } |
    { object: null; el: null };
  export const SelectedContext = React.createContext<Selected>(null!);


  type Props = { children: React.ReactNode };
  type State = Selected;
  export class Provider extends React.Component<Props, State> {
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
      return (
        <PropGetterContext.Provider value={this.getComponentProps}>
          <SelectedContext.Provider value={this.state}>
            {this.props.children}
          </SelectedContext.Provider>
        </PropGetterContext.Provider>
      );
    }
  }
}

export default EditingContext;