import LObject from '../../../common/data/LObject';
import { makeElement } from '../../util/dom';

import './ObjectEditor.scss';
import FieldEditor from '../FieldEditor/FieldEditor';
import ComponentPreview from '../ComponentPreview/ComponentPreview';

export default class ObjectEditor {
  public readonly element: HTMLElement;

  public constructor(object: LObject) {
    this.element = <div className="object-editor">
      <div className="object-id">Id: {object.id}</div>
      {object.parent &&
        <div className="object-id">Parent: {object.parent.id}</div>}
      {[...object.getFieldNames()].map(n => new FieldEditor(object, n).element)}
      {object.type === 'component' && new ComponentPreview(object).element}
    </div>;
  }
}