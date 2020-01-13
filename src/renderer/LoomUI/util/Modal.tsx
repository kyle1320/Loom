import React from 'react';

import './Modal.scss';
import IconButton from './IconButton';

const ModalContext = React.createContext<React.Dispatch<ProviderAction>>(null!);

let counter = 0;
type ModalProps = {
  onClose: () => void;
  children: React.ReactNode;
};
const Modal: React.FC<ModalProps> = (props: ModalProps) => {
  const [id] = React.useState(() => String(counter++));
  const dispatch = React.useContext(ModalContext);

  React.useEffect(() => {
    dispatch({
      type: 'upsert',
      data: {
        id,
        onClose: props.onClose,
        children: props.children
      },
    });
  }, [dispatch, id, props.onClose, props.children]);
  React.useEffect(() => () => dispatch({ type: 'delete', id }), []);

  return null;
}
export default Modal;

type ModalInfo = {
  id: string;
  onClose: () => void;
  children: React.ReactNode;
};
type ProviderState = { [key: string]: ModalInfo };
type ProviderAction =
  { type: 'upsert'; data: ModalInfo } |
  { type: 'delete'; id: string }

function reduce(state: ProviderState, action: ProviderAction): ProviderState {
  const newState: ProviderState = Object.assign({}, state);
  switch (action.type) {
    case 'upsert':
      newState[action.data.id] = action.data;
      break;
    case 'delete':
      if (action.id in newState) {
        newState[action.id].onClose();
        delete newState[action.id];
      }
      break;
  }
  return newState;
}

type ModalComponentProps = {
  onClose: () => void;
  children: React.ReactNode;
}
const ModalComponent: React.FC<ModalComponentProps>
  = (props: ModalComponentProps) => {
    return <div className="modal__container">
      <div className="modal">
        <IconButton
          className="modal__close-btn"
          icon="fa-times"
          onClick={props.onClose}></IconButton>
        {props.children}
      </div>
    </div>;
  };

type ProviderProps = { children: React.ReactNode };
export const ModalProvider: React.FC<ProviderProps> =
  (props: ProviderProps) => {
    const [state, dispatch] = React.useReducer(reduce, {});
    const modals: JSX.Element[] = [];

    for (const key in state) {
      modals.push(
        <ModalComponent key={key} onClose={state[key].onClose}>
          {state[key].children}
        </ModalComponent>
      );
    }

    return <ModalContext.Provider value={dispatch}>
      {props.children}
      {modals}
    </ModalContext.Provider>;
  }