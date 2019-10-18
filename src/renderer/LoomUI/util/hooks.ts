import React from 'react';
import LObject from '../../../common/data/LObject';
import Field from '../../../common/data/Field';
import Link from '../../../common/data/Link';
import LinkObserver from '../../../common/events/LinkObserver';
import ContentObserver from '../../../common/events/ContentObserver';

export function useForceUpdate(): [object, () => void] {
  const [value, set] = React.useState({});
  return [value, React.useCallback(() => set({}), [])];
}

export function useFieldValue<F extends Field, R>(
  field: F,
  context: LObject,
  getter: (field: F, context: LObject) => R,
  recursive = true
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

export function useWatchPaths(context: LObject, paths: string[]): void {
  const [, forceUpdate] = useForceUpdate();
  React.useEffect(() => {
    const observers
      = paths.map(p => context.getLink(p).observe().on('update', forceUpdate));
    return () => observers.forEach(o => o.destroy());
  }, [context, ...paths]);
}

export function useLink(object: LObject, name: string): Link {
  return React.useMemo(() => object.getLink(name), [object, name]);
}