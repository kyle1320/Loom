import LObject from '../../../common/data/LObject';
import { makeElement } from '../../util/dom';

import './ObjectEditor.scss';
import FieldEditor from '../FieldEditor/FieldEditor';
import ComponentPreview from '../ComponentPreview/ComponentPreview';

export default class ObjectEditor {
  public readonly element: HTMLElement;

  public constructor(object: LObject) {
    const fieldMap = new Map<string, FieldEditor>();

    for (const key of [...object.getFieldNames()].sort()) {
      fieldMap.set(key, new FieldEditor(object, key));
    }

    object.addPathListener('*', key => {
      // TODO: handle adding / removing fields
      if (fieldMap.has(key)) {
        fieldMap.get(key)!.update();
      }
    });

    this.element = <div className="object-editor">
      <div className="object-id">Id: {object.id}</div>
      {object.parent &&
        <div className="parent-id">Parent Id: {object.parent.id}</div>}
      <table>
        {[...fieldMap].map(([key, f]) => {
          const inherited = !object.hasOwnField(key);
          return <tr>
            <td><div
              className={`object-editor__key${inherited ? ' inherited' : ''}`}>
              {key}{inherited && ' (inherited)'}:
            </div></td>
            <td>{f.element}</td>
          </tr>;
        })}
      </table>
      {object.type === 'component' && new ComponentPreview(object).element}
    </div>;
  }
}