import React, { Component, ReactElement } from 'react';
import FieldEditor from '../../../registry/FieldEditor';
import BasicField from '../../../../common/data/BasicField';

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
    // TODO: render links specially
    return <div
      ref={this.ref}
      className="basic-field-editor"
      contentEditable
      onInput={this.update} >

      {this.props.value}
    </div>;
  }
}

const BasicFieldEditor: FieldEditor = (props: FieldEditor.Props) => {
  const field = (props.field as BasicField);
  const onChange = React.useCallback(
    (value: string) => field.set(value),
    [props.field]
  );
  const value = field.getAsRawString(props.context);

  return <BasicFieldEditorInner value={value} onChange={onChange} />
}

export default BasicFieldEditor;