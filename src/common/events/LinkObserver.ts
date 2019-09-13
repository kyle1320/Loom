import Link from '../data/Link';
import EventEmitter from '../util/EventEmitter';
import ContentObserver from './ContentObserver';

// Watches for changes to the way a Link is resolved.
// This includes field additions, removals, and replacements.
// The 'update' event covers all three of these.
class LinkObserver extends EventEmitter<{
  update: void;
  fieldAdded: Link;
  fieldRemoved: Link;
  fieldChanged: Link;
}> {
  public constructor (public readonly link: Link) {
    super();

    this.onFieldAdded = this.onFieldAdded.bind(this);
    this.onFieldRemoved = this.onFieldRemoved.bind(this);
    this.onFieldChanged = this.onFieldChanged.bind(this);

    // TODO: handle case where object is invalid / not accessible (yet)
    const object = link.getObject();
    object.on('fieldAdded', this.onFieldAdded);
    object.on('fieldRemoved', this.onFieldRemoved);
    object.on('fieldChanged', this.onFieldChanged);
  }

  public destroy(): void {
    const object = this.link.getObject();
    object.removeListener('fieldAdded', this.onFieldRemoved);
    object.removeListener('fieldRemoved', this.onFieldAdded);
    object.removeListener('fieldChanged', this.onFieldChanged);
  }

  public content(recursive: boolean): ContentObserver {
    return new ContentObserver(this, recursive);
  }

  private onFieldAdded(key: string): void {
    if (this.link.matchesKey(key)) {
      const fieldLink = this.link.withFieldName(key);

      this.emit('fieldAdded', fieldLink);
      this.emit('update');
    }
  }

  private onFieldRemoved(key: string): void {
    if (this.link.matchesKey(key)) {
      const fieldLink = this.link.withFieldName(key);

      this.emit('fieldRemoved', fieldLink);
      this.emit('update');
    }
  }

  private onFieldChanged(key: string): void {
    if (this.link.matchesKey(key)) {
      const fieldLink = this.link.withFieldName(key);

      this.emit('fieldChanged', fieldLink);
      this.emit('update');
    }
  }
}

namespace LinkObserver {
  export type Flags = Record<string, boolean>;
}

export default LinkObserver;