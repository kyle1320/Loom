import * as loom from 'loom-core';

import ElementEditor from './ElementEditor';
import LoomUI from '@/LoomUI';
import { UIComponent } from '@/UIComponent';
import { makeElement } from '@/util/dom';

import './Editor.scss';

class NoSelection extends UIComponent {
  public constructor() {
    super(makeElement('div', { className: 'no-data-editor '},
      makeElement('div', { className: 'heading' },
        'No data selected'
      ),
      makeElement('div', { className: 'subtitle' },
        'Select an object on the left to view / edit'
      )
    ));
  }
}

class UnknownSelection extends UIComponent {
  public constructor() {
    super(makeElement('div', { className: 'no-data-editor '},
      makeElement('div', { className: 'heading' },
        'Unexpected Selection!'
      )
    ));
  }
}

function getEditor(ui: LoomUI, content = ui.content.get()): UIComponent {
  if (content instanceof loom.Page) {
    return new ElementEditor(ui);
  } else if (content instanceof loom.Element) {
    return new ElementEditor(ui);
  } else if (content) {
    return new UnknownSelection();
  } else {
    return new NoSelection();
  }
}

export default class Editor extends UIComponent {
  public constructor(ui: LoomUI) {
    super(makeElement('div', { className: 'editor' }), getEditor(ui));

    this.autoCleanup(ui.content.watch(content => {
      this.empty();
      this.appendChild(getEditor(ui, content));
    }));
  }
}