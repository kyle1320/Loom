import { makeElement } from '../../util/dom';

import './FieldEditor.scss';
import BasicField from '../../../common/extensions/BasicFields/BasicField';
import Field from '../../../common/data/Field';

export default class FieldEditor {
  private attr: Field;
  private value: HTMLElement;

  public readonly element: HTMLElement;

  public constructor(attr: Field) {
    this.attr = attr;

    this.element = <div className='field-editor'>
      {attr.key}: {
        this.value = <div className='field' contentEditable='true' onclick={() => {}}>
          {this.attr.get()}
        </div>
      }
    </div>;

    if (attr instanceof BasicField) {
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