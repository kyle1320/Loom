import React from 'react';

import Field from '../../common/data/fields/Field';
import LObject from '../../common/data/objects/LObject';

import FieldEditor from './FieldEditor';
import ObjectEditor from './ObjectEditor';
import FieldDisplay from './FieldDisplay';

export default class UIRegistry {
  private fieldEditors: Map<string, FieldEditor> = new Map();
  private fieldDisplays: Map<string, FieldDisplay> = new Map();
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

  /** Field Displays **/

  public registerFieldDisplay(type: Function, display: FieldDisplay): void {
    this.fieldDisplays.set(type.name, display);
  }

  public getFieldDisplay(
    field: Field
  ): React.ComponentType<FieldDisplay.Props> | undefined {
    return this.fieldDisplays.get(field.constructor.name);
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