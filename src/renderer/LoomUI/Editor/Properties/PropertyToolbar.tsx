import React from 'react';

import IconButton from '../../util/IconButton';
import Modal from '../../util/Modal';
import Dialog from '../Dialog';
import AddFieldDialog from '../Dialog/AddFieldDialog';

import './PropertyToolbar.scss';

interface Props {
  showInherited: boolean;
  toggleShowInherited: () => void;
}

interface DialogButtonProps {
  icon: string;
  title: string;
  dialog: Dialog;
}
type DialogButton = React.FC<DialogButtonProps>;
const DialogButton: DialogButton = (props: DialogButtonProps) => {
  const [showModal, setShow] = React.useState(false);
  const show = React.useCallback(() => setShow(true), []);
  const hide = React.useCallback(() => setShow(false), []);

  return <>
    <IconButton
      icon={props.icon}
      className="dialog"
      title={props.title}
      onClick={show}/>
    {showModal &&
      <Modal onClose={hide}>
        <props.dialog onClose={hide} />
      </Modal>
    }
  </>;
}

const PropertyToolbar: React.FC<Props> = (props: Props) => {
  return <div className="property-toolbar">
    <IconButton
      fa="fas"
      icon="fa-layer-group"
      onClick={props.toggleShowInherited}
      title={`${props.showInherited ? 'Hide' : 'Show'} inherited fields`}
      className={props.showInherited ? 'active toggle' : 'toggle'} />
    <DialogButton
      icon="fa-plus"
      title="Add a new field"
      dialog={AddFieldDialog}/>
  </div>;
}

export default PropertyToolbar;