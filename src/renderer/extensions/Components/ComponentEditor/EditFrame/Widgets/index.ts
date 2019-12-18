import DataObject from '../../../../../../common/data/objects/DataObject';

export interface WidgetProps {
  object: DataObject | null;
}
export type Widget = React.ComponentType<WidgetProps>;