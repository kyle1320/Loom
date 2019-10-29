import React, { Component, ReactElement } from 'react';
import FieldEditor from '../../../registry/FieldEditor';
import MutableField from '../../../../common/data/fields/MutableField';

import './MutableFieldEditor.scss';

interface Props { value: string; onChange: (val: string) => void }

class MutableFieldEditorInner extends Component<Props> {
  private ref = React.createRef<HTMLDivElement>();
  private lastText: string | null = null;

  public shouldComponentUpdate(nextProps: Props): boolean {
    console.log('edit', nextProps.value, this.lastText);
    return nextProps.value !== this.lastText
      || nextProps.onChange !== this.props.onChange;
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
    console.log('rendering', this.props.value, this.lastText)
    return <div
      ref={this.ref}
      className="basic-field-editor"
      contentEditable
      onInput={this.update} >

      {this.props.value}
    </div>;
  }
}

const MutableFieldEditor: FieldEditor = (props: FieldEditor.Props) => {
  const field = (props.field as MutableField);
  const onChange = React.useCallback(
    (value: string) => field.set(value),
    [props.field]
  );
  const value = field.getAsRawString(props.context);

  return <MutableFieldEditorInner value={value} onChange={onChange} />
}

export default MutableFieldEditor;