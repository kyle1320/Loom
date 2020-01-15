import React from 'react';

import IconButton from '../../util/IconButton';
import Modal from '../../util/Modal';
import AddFieldDialog from '../Dialogs/AddFieldDialog';
import DataObject from '../../../../common/data/objects/DataObject';

import './PropertyToolbar.scss';

interface DialogButtonProps {
  icon: string;
  title: string;
  children: (onClose: () => void) => React.ReactNode;
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
    {showModal && <Modal onClose={hide}>{props.children(hide)}</Modal>}
  </>;
}

interface Props {
  showInherited: boolean;
  toggleShowInherited: () => void;
  context: DataObject;
}
const PropertyToolbar: React.FC<Props> = (props: Props) => {
  return <div className="property-toolbar">
    <IconButton
      fa="fas"
      icon="fa-layer-group"
      onClick={props.toggleShowInherited}
      title={`${props.showInherited ? 'Hide' : 'Show'} inherited fields`}
      className={props.showInherited ? 'active toggle' : 'toggle'} />
    <DialogButton icon="fa-plus" title="Add a new field">
      {hide => <AddFieldDialog onClose={hide} object={props.context} />}
    </DialogButton>
  </div>;
}

export default PropertyToolbar;