import { makeElement } from '../../util/dom';

import './FieldEditor.scss';
import BasicField from '../../../common/extensions/BasicFields/BasicField';
import LObject from '../../../common/data/LObject';
import FieldReferenceError from '../../../common/errors/FieldReferenceError';

export default class FieldEditor {
  private value: HTMLElement;

  public readonly element: HTMLElement;

  public constructor(
    private obj: LObject,
    private key: string
  ) {
    const field = obj.getField(key);

    if (!field) {
      throw new FieldReferenceError();
    }

    const inherited = !obj.hasOwnField(key);

    this.element = <div className='field-editor'>
      {
        this.value = <div
          className='field'
          contentEditable={
            (field instanceof BasicField && !inherited).toString()
          }
          onclick={() => {}}>
          {obj.getFieldValue(key)}
        </div>
      }
    </div>;

    if (field instanceof BasicField) {
      this.value.addEventListener('input', () => {
        field.set(this.value.textContent || '');
      });
    }
  }

  public update(): void {
    this.value.textContent = this.obj.getFieldValue(this.key);
  }
}