import FieldObserver from './FieldObserver';
import ContentObserver from './ContentObserver';
import LinkObserver from './LinkObserver';
import Field from '../data/Field';
import LObject from '../data/LObject';

export default class FieldDependencyObserver extends FieldObserver {
  private observers: (ContentObserver | LinkObserver)[];

  public constructor (
    field: Field,
    context: LObject,
    recursive: boolean
  ) {
    super();

    const emitUpdate = this.emit.bind(this, 'update');

    this.observers = field.dependencies(context).map(l => {
      return recursive
        ? l.observe().content(true).on('update', emitUpdate)
        : l.observe().on('update', emitUpdate);
    });
  }

  public destroy(): void {
    this.observers.forEach(o => o.destroy());
  }
}