import Project from '../common/data/Project';
import LObject from '../common/data/LObject';
import Field from '../common/data/Field';

import Extension from './extensions/Extension';
import Components from './extensions/Components';
import BasicFields from './extensions/BasicFields';

import React from 'react';
import {
  FieldEditor,
  FieldEditorProps,
  PlainFieldEditor } from './registry/FieldEditor';
import {
  ObjectEditor,
  ObjectEditorProps,
  PlainObjectEditor } from './registry/ObjectEditor';

export interface Category {
  key: string;
  name: string;
  path: string;
}

const defaultCategory = { key: 'all', name: 'All', path: '*' };

export default class Renderer {
  private static readonly defaultExtensions: Extension[] = [
    BasicFields,
    Components
  ];

  private project: Project | null = null;

  private rawFieldEditors: Map<string, FieldEditor> = new Map();
  private fieldCategories: Category[] = [defaultCategory];

  private objectEditors: Map<string, ObjectEditor> = new Map();

  public constructor () {
    Renderer.defaultExtensions.forEach(ex => ex.initRenderer(this));
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

  public registerRawFieldEditor(type: string, editor: FieldEditor): void {
    this.rawFieldEditors.set(type, editor);
  }

  public getRawFieldEditor(
    field: Field,
    context: LObject
  ): React.ReactElement<FieldEditorProps> {
    const Editor = this.rawFieldEditors
      .get(field.constructor.name) || PlainFieldEditor;
    return React.createElement(Editor, { field, context });
  }

  /** EDITORS **/

  public registerObjectEditor(type: string, editor: ObjectEditor): void {
    this.objectEditors.set(type, editor);
  }

  public getObjectEditor(
    object: LObject
  ): React.ReactElement<ObjectEditorProps> {
    const Editor = this.objectEditors.get(object.type) || PlainObjectEditor;
    return React.createElement(Editor, { object });
  }
}