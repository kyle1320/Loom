import FieldObserver from '../../events/FieldObserver';
import ComponentContentField
  from './ComponentContentField';
import LObject from '../../data/LObject';
import ContentObserver from '../../events/ContentObserver';
import LinkObserver from '../../events/LinkObserver';

export default class ComponentContentFieldObserver extends FieldObserver {
  private tagObs: ContentObserver | LinkObserver;
  private attrsObs: ContentObserver | LinkObserver;
  private contentObs: ContentObserver | LinkObserver;

  public constructor (
    field: ComponentContentField,
    context: LObject,
    recursive: boolean
  ) {
    super();

    const emitUpdate = this.emit.bind(this, 'update');

    this.tagObs = field.tag(context).observe().on('update', emitUpdate);
    this.attrsObs = field.attrs(context).observe().on('update', emitUpdate);
    this.contentObs = field.content(context).observe().on('update', emitUpdate);

    if (recursive) {
      this.tagObs = this.tagObs.content(true).on('update', emitUpdate);
      this.attrsObs = this.attrsObs.content(true).on('update', emitUpdate);
      this.contentObs = this.contentObs.content(true).on('update', emitUpdate);
    }
  }

  public destroy(): void {
    this.tagObs.destroy();
    this.attrsObs.destroy();
    this.contentObs.destroy();
  }
}