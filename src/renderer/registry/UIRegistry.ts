import React from 'react';

import LObject from '../../common/data/objects/LObject';

import FieldEditor from './FieldEditor';
import ObjectEditor from './ObjectEditor';

export default class UIRegistry {
  private fieldEditors: Map<string, FieldEditor> = new Map();
  private objectEditors: Map<string, ObjectEditor> = new Map();

  /** Field Editors **/

  public registerFieldEditor(name: string, editor: FieldEditor): void {
    // TODO: allow multiple editors?
    this.fieldEditors.set(name, editor);
  }

  public getFieldEditor(
    name: string
  ): React.ComponentType<FieldEditor.Props> | undefined {
    return this.fieldEditors.get(name);
  }

  /** Object Editors **/

  public registerObjectEditor(type: string, editor: ObjectEditor): void {
    this.objectEditors.set(type, editor);
  }

  public getObjectEditor(
    object: LObject
  ): React.ComponentType<ObjectEditor.Props> | undefined {
    return this.objectEditors.get(LObject.baseId(object));
  }
}