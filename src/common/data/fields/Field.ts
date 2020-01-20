import LObject from '../objects/LObject';
import FieldObserver from '../../events/FieldObserver';

export default interface Field {
  get(context: LObject): string;
  observe(context: LObject, recursive: boolean): FieldObserver;
}