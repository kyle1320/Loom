import LObject from '../objects/LObject';
import Field from './Field';
import Link from '../Link';
import ContentObserver from '../../events/ContentObserver';
import LinkObserver from '../../events/LinkObserver';
import FieldObserver from '../../events/FieldObserver';

class ComputedFieldObserver extends FieldObserver {
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

export default abstract class ComputedField implements Field {
  public abstract get(context: LObject): string;
  public abstract dependencies(context: LObject): Link[];

  public observe(context: LObject, recursive: boolean): ComputedFieldObserver {
    return new ComputedFieldObserver(this, context, recursive);
  }
}