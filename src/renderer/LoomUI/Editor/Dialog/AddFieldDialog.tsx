import React from 'react';
import Dialog from '.';

const AddFieldDialog: Dialog = (props: Dialog.Props) => {
  return <div onClick={props.onClose}>Click to Close</div>;
}

export default AddFieldDialog;