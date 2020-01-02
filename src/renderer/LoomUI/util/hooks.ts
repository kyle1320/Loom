import React from 'react';
import LObject from '../../../common/data/objects/LObject';
import Field from '../../../common/data/fields/Field';
import Link from '../../../common/data/Link';
import LinkObserver from '../../../common/events/LinkObserver';
import ContentObserver from '../../../common/events/ContentObserver';
import EventEmitter from '../../../common/util/EventEmitter';

export function useForceUpdate(): [object, () => void] {
  const [value, set] = React.useState({});
  return [value, React.useCallback(() => set({}), [])];
}

export function useFieldGetter<F extends Field, R>(
  field: F,
  context: LObject,
  getter: (field: F, context: LObject) => R,
  recursive: boolean
): R | null {
  const [dep, forceUpdate] = useForceUpdate();
  const value = React.useMemo(() => {
    try { return getter(field, context); }
    catch (e) { return null; }
  }, [field, context, dep]);
  React.useEffect(() => {
    const observer = field
      .observe(context, recursive)
      .on('update', forceUpdate);
    return () => observer.destroy();
  }, [field, context]);
  return value;
}

export function useFieldValue(
  field: Field,
  context: LObject,
  recursive = true
): string | null {
  return useFieldGetter(field, context, (f, c) => f.get(c), recursive);
}

/** Watches the link for updates, ignoring field content */
export function useWatchLink(link: Link): Link;
/** Watches the link for updates, including field content */
export function useWatchLink(link: Link, recursive: boolean): Link;
export function useWatchLink(link: Link, recursive?: boolean): Link {
  const [, forceUpdate] = useForceUpdate();
  React.useEffect(() => {
    let observer: LinkObserver | ContentObserver = link.observe();
    if (typeof recursive === 'boolean') {
      observer = observer.content(recursive).on('update', forceUpdate);
    } else {
      observer = observer.on('update', forceUpdate);
    }
    return () => observer.destroy();
  }, [link, recursive]);
  return link;
}

export function useWatchEvent<T, E extends keyof T>(
  obj: EventEmitter<T>,
  evt: E
): void {
  const [, forceUpdate] = useForceUpdate();
  React.useEffect(() => {
    obj.on(evt, forceUpdate);
    return () => void obj.removeListener(evt, forceUpdate);
  }, [obj, evt]);
}

export function useWatchPaths(context: LObject, paths: string[]): void {
  const [, forceUpdate] = useForceUpdate();
  React.useEffect(() => {
    const observers = paths.map(
      p => Link.to(context, p).observe().on('update', forceUpdate)
    );
    return () => observers.forEach(o => o.destroy());
  }, [context, ...paths]);
}

export function useLink(object: LObject, name: string): Link {
  return React.useMemo(() => Link.to(object, name), [object, name]);
}