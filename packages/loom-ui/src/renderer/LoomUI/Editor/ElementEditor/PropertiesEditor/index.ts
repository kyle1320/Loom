import * as loom from 'loom-core';

import LoomUI from '../../..';
import { UIComponent } from '../../../UIComponent';
import { makeElement } from '../../../util/dom';
import Input from '../../../common/Input';
import KeyValueList from '../../../common/KeyValueList';

import './PropertiesEditor.scss';

export default class PropertiesEditor extends UIComponent {
  public constructor(ui: LoomUI) {
    super(makeElement('div', { className: 'properties-editor' }));

    this.listen(ui, 'updateData', data => {
      this.empty();

      if (data instanceof loom.TextNode) {
        this.appendChild(new ContentField(data.source));
      } else if (data instanceof loom.Element) {
        this.appendChild(new TagField(data.source));
        this.appendChild(new KeyValueList('Attributes', data.source.attrs));
      }
    });
  }
}

class PropertyField extends UIComponent {
  public constructor(
    name: string,
    private readonly input: Input
  ) {
    super(makeElement('label', { className: 'property' }, name));

    this.appendChild(input);
  }

  protected set = (value = ''): void => {
    this.input.set(value);
  }
}

class ContentField extends PropertyField {
  public constructor(node: loom.TextNodeDef) {
    super('Content',
      new Input(node.content).on('change', val => node.content = val)
    );

    this.listen(node, 'contentChanged', this.set);
  }
}

class TagField extends PropertyField {
  public constructor(node: loom.ElementDef) {
    super('Tag',
      new Input(node.tag).on('change', val => node.tag = val)
    );

    this.listen(node, 'tagChanged', this.set);
  }
}
