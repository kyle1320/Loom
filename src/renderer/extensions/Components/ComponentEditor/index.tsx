import React from 'react';
import SplitPane from 'react-split-pane';

import ComponentRenderer from './Renderers/ComponentRenderer';
import WithEditFrame from './EditFrame/WithEditFrame';

import ObjectEditor from '../../../registry/ObjectEditor';
import Properties from '../../../LoomUI/Editor/Properties';
import { primary1 } from '../../../LoomUI/util/color';
import { ResizableFrame } from '../../../LoomUI/util/Frame';

import './ComponentEditor.scss';

const ComponentEditor: ObjectEditor = (props: ObjectEditor.Props) => {
  return <div className="component-editor">
    <ResizableFrame body={React.useCallback(
      () => <WithEditFrame>
        <ComponentRenderer object={props.object} />
      </WithEditFrame>,
      [props.object]
    )} />
  </div>;
}

const ComponentEditorWithProps: ObjectEditor = (props: ObjectEditor.Props) => {
  return <SplitPane
    split="vertical"
    minSize={200}
    primary="second"
    pane2Style={{ backgroundColor: primary1 }} >
    <ComponentEditor {...props} />
    <Properties object={props.object} />
  </SplitPane>;
}

export default ComponentEditorWithProps;