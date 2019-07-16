import { makeElement } from '../../util/dom';
import Attribute from '../../../common/data/Attribute';

import './AttributeEditor.scss';

export default class AttributeEditor {
  private attr: Attribute;
  private value: HTMLElement;

  public readonly element: HTMLElement;

  public constructor(attr: Attribute) {
    this.attr = attr;

    this.element = <div className='attribute-editor'>
      {attr.key}: {
        this.value = <div className='attribute' contentEditable='true' onclick={() => {}}>
          {this.attr.raw()}
        </div>
      }
    </div>;

    this.value.addEventListener('input', () => {
      this.update(this.value.innerHTML);
    });

    this.update();

    this.attr.on('update', () => this.update());
  }

  private update(value = this.attr.raw()) {
    this.attr.set(value);

    var newValue = this.attr.computedParts()
      .map(p => typeof p === 'string' ? p : (
        <span contentEditable='false' title={p.id}>
          {p.computed()}
        </span>
      ).outerHTML).join('');

    if (newValue !== this.value.innerHTML) {
      this.value.innerHTML = newValue;
    }
  }
}