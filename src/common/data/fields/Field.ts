import LObject from '../objects/LObject';
import Link from '../Link';
import FieldObserver from '../../events/FieldObserver';

export default interface Field {
  get(context: LObject): string;
  dependencies(context: LObject): Link[];

  observe(context: LObject, recursive: boolean): FieldObserver;
}