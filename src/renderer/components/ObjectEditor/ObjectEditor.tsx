import LObject from '../../../common/data/LObject';
import { makeElement } from '../../util/dom';

import './ObjectEditor.scss';
import AttributeEditor from '../AttributeEditor/AttributeEditor';

export default class ObjectEditor {
  public readonly element: HTMLElement;

  public constructor(object: LObject) {
    this.element = <div className="object-editor">
      <div className="object-id">Id: {object.id}</div>
      {object.parent &&
        <div className="object-id">Parent: {object.parent.id}</div>}
      {[...object.getAttributes()].map(a => new AttributeEditor(a).element)}
    </div>;
  }
}