import Field from '../../../../../common/data/fields/Field';
import LObject from '../../../../../common/data/objects/LObject';

export interface RendererProps<F extends Field = Field> {
  field: F;
  object: LObject;
}
export type Renderer<F extends Field = Field>
  = React.ComponentType<RendererProps<F>>;