import React from 'react';
import SplitPane from 'react-split-pane';

import ComponentRenderer from './Renderers/ComponentRenderer';
import EditingContext from './EditFrame/EditingContext';
import EditFrame from './EditFrame';

import ObjectEditor from '../../../registry/ObjectEditor';
import Properties from '../../../LoomUI/Editor/Properties';
import { primary1 } from '../../../LoomUI/util/color';
import Floating from '../../../LoomUI/util/Floating';
import Frame from '../../../LoomUI/util/Frame';
import { Consumer } from '../../../LoomUI/util/Context';

import './ComponentEditor.scss';

const ComponentEditor: ObjectEditor = (props: ObjectEditor.Props) => {
  return <div className="component-editor">
    <Floating>
      <EditingContext.Provider key={props.object.id}>
        <Consumer context={EditingContext.PropGetterContext}>
          {context =>
            <Frame>
              <EditingContext.PropGetterContext.Provider value={context}>
                <ComponentRenderer object={props.object} />
              </EditingContext.PropGetterContext.Provider>
            </Frame>
          }
        </Consumer>
        <EditFrame />
      </EditingContext.Provider>
    </Floating>
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