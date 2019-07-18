import { makeElement } from '../../util/dom';

import './AttributeEditor.scss';
import BasicAttribute from '../../../common/extensions/BasicAttributes/BasicAttribute';
import Attribute from '../../../common/data/Attribute';

export default class AttributeEditor {
  private attr: Attribute;
  private value: HTMLElement;

  public readonly element: HTMLElement;

  public constructor(attr: Attribute) {
    this.attr = attr;

    this.element = <div className='attribute-editor'>
      {attr.key}: {
        this.value = <div className='attribute' contentEditable='true' onclick={() => {}}>
          {this.attr.get()}
        </div>
      }
    </div>;

    if (attr instanceof BasicAttribute) {
      this.value.addEventListener('input', () => {
        attr.set(this.value.innerHTML);
      });
    }

    this.attr.on('update', () => this.update());
  }

  private update() {
    this.value.innerHTML = this.attr.get();
  }
}