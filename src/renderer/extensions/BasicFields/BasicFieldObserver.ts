import Link from '../../../common/data/Link';
import LObject from '../../../common/data/LObject';
import FieldObserver from '../../../common/events/FieldObserver';
import ContentObserver from '../../../common/events/ContentObserver';
import { diff } from '../../util';
import BasicField from './BasicField';

export default class BasicFieldObserver extends FieldObserver {
  public destroy: () => void;

  public constructor (
    field: BasicField,
    context: LObject,
    recursive: boolean
  ) {
    super();

    let dependencies: Link[] = [];
    const observers: Map<string, ContentObserver> = new Map();

    const updateAllDeps = (newLinks: Link[]): void => {
      if (!recursive) return;

      newLinks.sort(Link.compare);

      diff(
        dependencies,
        newLinks,
        (dep: Link, isAdd: boolean) => {
          const key = dep.toString();

          if (isAdd) {
            observers.set(
              key,
              new ContentObserver(dep, true)
                .on('update', this.emit.bind(this, 'update'))
            );
          } else {
            observers.get(key)!.destroy();
            observers.delete(key);
          }
        },
        Link.compare
      );

      dependencies = newLinks;
    };

    const updateListener = (): void => {
      updateAllDeps(field.dependencies(context));
      this.emit('update');
    };

    updateAllDeps(field.dependencies(context));
    field.on('update', updateListener);

    this.destroy = () => {
      updateAllDeps([]);
      field.removeListener('update', updateListener);
    };
  }
}