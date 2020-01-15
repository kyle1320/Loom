import React from 'react';
import Fuse from 'fuse.js';

import LObject from '../../common/data/objects/LObject';
import FieldEditor from './FieldEditor';
import ObjectEditor from './ObjectEditor';
import { HeadlessLink } from '../../common/data/Link';

export interface Category {
  name: string;
  paths: string[];
}

const defaultCategory = {
  name: 'Misc.',
  paths: ['*']
};

namespace UIRegistry {
  export interface FieldInfo {
    key: string;
    friendlyName?: string;
    helpText?: string;
    defaultValue?: string;
  }
}

class UIRegistry {
  private fieldEditors: Map<string, FieldEditor> = new Map();
  private objectEditors: Map<string, ObjectEditor> = new Map();

  private fieldCategories: Category[] = [];
  private fieldInfo: Map<string, UIRegistry.FieldInfo> = new Map();

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

  public registerCategories(...categories: Category[]): void {
    categories.forEach(c => this.registerCategory(c));
  }

  public getCategories(): Category[] {
    return this.fieldCategories.concat([ defaultCategory ]);
  }

  public getCategory(key: string): string {
    for (const cat of this.fieldCategories) {
      for (const path of cat.paths) {
        if (new HeadlessLink('', path).matchesKey(key)) {
          return cat.name;
        }
      }
    }
    return '';
  }

  /** FIELD NAMES **/

  public registerField(info: UIRegistry.FieldInfo): void {
    info.key = info.key.toLowerCase();

    this.fieldInfo.set(info.key, info);
  }

  public registerFields(...infos: UIRegistry.FieldInfo[]): void {
    infos.forEach(i => this.registerField(i));
  }

  public getFieldInfo(key: string): UIRegistry.FieldInfo | undefined {
    return this.fieldInfo.get(key.toLowerCase());
  }

  public getFieldName(key: string): string | undefined {
    return this.getFieldInfo(key)?.friendlyName;
  }

  public getFields(search = ''): UIRegistry.FieldInfo[] {
    const fields = [...this.fieldInfo.values()];

    if (!search) return fields;

    return new Fuse(fields, {
      keys: [
        { name: 'key', weight: 0.2 },
        { name: 'friendlyName', weight: 0.5 },
        { name: 'helpText', weight: 0.3 }
      ],
      threshold: 0.2
    }).search(search);
  }
}

export default UIRegistry;