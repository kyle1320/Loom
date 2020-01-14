import React from 'react';

namespace Dialog {
  export interface Props { onClose: () => void }
}

type Dialog = React.ComponentType<Dialog.Props>;

export default Dialog;