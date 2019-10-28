import Field from '../common/data/Field';
import Project from '../common/data/Project';
import LObject from '../common/data/LObject';
import BasicField from '../common/data/BasicField';

import React from 'react';

import Extension from './extensions/Extension';
import Components from './extensions/Components';
import Styles from './extensions/Styles';

import FieldEditor from './registry/FieldEditor';
import ObjectEditor from './registry/ObjectEditor';
import FieldDisplay from './registry/FieldDisplay';

import BasicFieldEditor from './LoomUI/Properties/editors/BasicFieldEditor';
import PlainObjectEditor from './LoomUI/Properties/editors/PlainObjectEditor';
import PlainFieldDisplay from './LoomUI/Properties/editors/PlainFieldDisplay';

export interface CategorySection {
  name: string;
  paths: string[];
}
export interface Category extends CategorySection {
  key: string;
  sections: CategorySection[];
}

const defaultCategory = { key: 'all', name: 'All', paths: ['*'], sections: [] };

export default class Renderer {
  private static readonly defaultExtensions: Extension[] = [
    Components,
    Styles
  ];

  private project: Project | null = null;

  private fieldEditors: Map<string, FieldEditor> = new Map();
  private fieldDisplays: Map<string, FieldDisplay> = new Map();
  private fieldCategories: Category[] = [defaultCategory];
  /** Map from field keys to user-friendly names */
  private fieldNames: Map<string, string> = new Map();

  private objectEditors: Map<string, ObjectEditor> = new Map();

  public constructor () {
    Renderer.defaultExtensions.forEach(ex => {
      ex.initRenderer && ex.initRenderer(this)
    });
  }

  /** PROJECT **/

  public getProject(): Project | null {
    return this.project;
  }

  public setProject(project: Project): void {
    this.project = project;
  }

  public loadProject(data: Project.SerializedData): void {
    this.setProject(Project.deserialize(data, Renderer.defaultExtensions));
  }

  public newProject(): void {
    const proj = new Project();
    Renderer.defaultExtensions.forEach(ex => proj.addExtension(ex));
    this.setProject(proj);
  }

  /** FIELDS **/

  public registerCategory(category: Category): void {
    this.fieldCategories.push(category);
  }

  public getCategories(): Category[] {
    return this.fieldCategories.slice();
  }

  public getDefaultCategory(): Category {
    return this.fieldCategories[0];
  }

  public registerFieldName(key: string, name: string): void {
    this.fieldNames.set(key.toLowerCase(), name);
  }

  public getFieldName(key: string): string | undefined {
    return this.fieldNames.get(key.toLowerCase());
  }

  /** EDITORS **/

  public registerFieldEditor(name: string, editor: FieldEditor): void {
    // TODO: allow multiple editors?
    this.fieldEditors.set(name, editor);
  }

  public registerFieldDisplay(type: Function, display: FieldDisplay): void {
    this.fieldDisplays.set(type.name, display);
  }

  public getRawFieldEditor(
    field: BasicField,
    context: LObject
  ): React.ReactElement | null {
    return React.createElement(BasicFieldEditor, { field, context });
  }

  public getFieldEditor(
    name: string,
    field: BasicField,
    context: LObject
  ): React.ReactElement<FieldEditor.Props> | null {
    const Editor = this.fieldEditors.get(name);
    return Editor ? React.createElement(Editor, { field, context }) : null;
  }

  public getFieldDisplay(
    field: Field,
    context: LObject
  ): React.ReactElement<FieldDisplay.Props> | null {
    return React.createElement(
      this.fieldDisplays.get(field.constructor.name) || PlainFieldDisplay,
      { field, context }
    );
  }

  public hasFieldEditor(name: string): boolean {
    return this.fieldEditors.has(name);
  }

  public registerObjectEditor(type: string, editor: ObjectEditor): void {
    this.objectEditors.set(type, editor);
  }

  public getObjectEditor(
    object: LObject
  ): React.ReactElement<ObjectEditor.Props> {
    const Editor = this.objectEditors.get(object.type) || PlainObjectEditor;
    return React.createElement(Editor, { object });
  }
}