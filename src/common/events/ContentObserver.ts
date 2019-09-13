import Link from '../data/Link';
import FieldObserver from './FieldObserver';
import LinkObserver from './LinkObserver';
import EventEmitter from '../util/EventEmitter';

// Combines link & field observers to watch for changes to the content
// of a resolved link.
export default class ContentObserver extends EventEmitter<{ update: Link }> {
  private fieldObservers = new Map<string, FieldObserver>();
  private linkObserver: LinkObserver;

  public constructor (
    link: Link | LinkObserver,
    private recursive: boolean
  ) {
    super();

    if (link instanceof LinkObserver) {
      this.linkObserver = link;
      link = link.link;
    } else {
      this.linkObserver = new LinkObserver(link);
    }

    this.linkObserver
      .on('fieldAdded', link => {
        this.addFieldListener(link);
        this.emit('update', link);
      })
      .on('fieldRemoved', link => {
        this.removeFieldListener(link);
        this.emit('update', link);
      })
      .on('fieldChanged', link => {
        this.removeFieldListener(link);
        this.addFieldListener(link);
        this.emit('update', link);
      });

    for (const key of link.getFieldNames()) {
      this.addFieldListener(link.withFieldName(key));
    }
  }

  public destroy(): void {
    for (const obs of this.fieldObservers.values()) {
      obs.destroy();
    }

    this.linkObserver.destroy();
  }

  private addFieldListener(link: Link): void {
    const key = link.toString();
    const field = link.getField();

    if (this.fieldObservers.has(key)) return;

    this.fieldObservers.set(
      key,

      field.observe(link.getObject(), this.recursive)
        .on('update', () => this.emit('update', link))
    );
  }

  private removeFieldListener(link: Link): void {
    const key = link.toString();
    const obs = this.fieldObservers.get(key);

    if (obs) {
      obs.destroy();
      this.fieldObservers.delete(key);
    }
  }
}