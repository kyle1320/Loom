import React from 'react';

import LObject from '../../common/data/objects/LObject';

import FieldEditor from './FieldEditor';
import ObjectEditor from './ObjectEditor';

export interface Category {
  name: string;
  paths: string[];
}

const defaultCategory = {
  name: 'Misc.',
  paths: ['*']
};

export default class UIRegistry {
  private fieldEditors: Map<string, FieldEditor> = new Map();
  private objectEditors: Map<string, ObjectEditor> = new Map();

  private fieldCategories: Category[] = [];
  /** Map from field keys to user-friendly names */
  private fieldNames: Map<string, string> = new Map();

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
    return this.objectEditors.get(LObject.typeOf(object) || '');
  }

  /** CATEGORIES **/

  public registerCategory(category: Category): void {
    this.fieldCategories.push(category);
  }

  public getCategories(): Category[] {
    return this.fieldCategories.concat([ defaultCategory ]);
  }

  /** FIELD NAMES **/

  public registerFieldName(key: string, name: string): void {
    this.fieldNames.set(key.toLowerCase(), name);
  }

  public getFieldName(key: string): string | undefined {
    return this.fieldNames.get(key.toLowerCase());
  }
}