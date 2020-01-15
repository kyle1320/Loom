import React from 'react';
import DataObject from '../../../../common/data/objects/DataObject';
import { useRegistry } from '../../WorkspaceContext';
import UIRegistry from '../../../registry/UIRegistry';

import './AddFieldDialog.scss';
import LObject from '../../../../common/data/objects/LObject';

type SearchResultProps = Props & {
  info: UIRegistry.FieldInfo;
}
const SearchResult: React.FC<SearchResultProps>
  = (props: SearchResultProps) => {
    const registry = useRegistry();
    const cat = registry.getCategory(props.info.key);
    const exists = LObject.hasOwnField(props.object, props.info.key);
    let className = 'field-search__result';

    if (exists) className += ' ' + className + '--exists';

    return <div
      className={className}
      onClick={() => {
        if (exists) return;

        props.object.addOwnField(props.info.key, props.info.defaultValue || '');
        props.onClose();
      }}>
      <div className="field-search__name">
        {props.info.friendlyName}
        <span className="field-search__key">{props.info.key}</span>
      </div>
      <div className="field-search__category">{cat}</div>
    </div>;
  }

interface Props {
  onClose: () => void;
  object: DataObject;
}
const AddFieldDialog: React.FC<Props> = (props: Props) => {
  const registry = useRegistry();
  const [name, setName] = React.useState('');
  const fields = registry.getFields(name);

  return <div className='add-field-dialog'>
    <div className='add-field-dialog__header'>
      <input value={name} onChange={
        React.useCallback((e: React.FormEvent<HTMLInputElement>) => {
          setName(e.currentTarget.value);
        }, [])
      } placeholder="Field Name"></input>
      <button onClick={() => {
        if (name) {
          props.object.addOwnField(name, '');
          props.onClose();
        }
      }} disabled={!name}>Add</button>
    </div>
    <div className="field-search">
      {fields
        .map(f => <SearchResult key={f.key} info={f} {...props} />)}
    </div>
  </div>;
}

export default AddFieldDialog;