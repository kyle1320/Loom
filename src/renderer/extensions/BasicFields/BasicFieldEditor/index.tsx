import React, { Component, ReactElement } from 'react';
import {
  FieldEditor,
  FieldEditorProps } from '../../../registry/FieldEditor';
import BasicField from '../BasicField';

import './BasicFieldEditor.scss';

interface Props { value: string; onChange: (val: string) => void }

class BasicFieldEditorInner extends Component<Props> {
  private ref = React.createRef<HTMLDivElement>();
  private lastText: string | null = null;

  public shouldComponentUpdate(nextProps: Props): boolean {
    return nextProps.value !== this.lastText;
  }

  public componentDidUpdate(prevProps: Props): void {
    if (prevProps.value !== this.props.value) {
      this.lastText = null;
    }
  }

  public update = (): void => {
    const el = this.ref.current;

    if (!el) return;

    const text = el.textContent || '';
    if (text !== this.lastText) {
      this.props.onChange(text);
    }
    this.lastText = text;
  }

  public render(): ReactElement {
    return <div
      ref={this.ref}
      className="basic-field-editor"
      contentEditable
      onInput={this.update} >

      {this.props.value}
    </div>;
  }
}

const BasicFieldEditor: FieldEditor = (props: FieldEditorProps) => {
  const onChange = React.useCallback(
    (value: string) => props.field.set(value),
    [props.field]
  );
  const value = (props.field as BasicField).getAsRawString(props.context);

  return <BasicFieldEditorInner value={value} onChange={onChange} />
}

export default BasicFieldEditor;