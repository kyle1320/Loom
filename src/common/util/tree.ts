import Link from '../data/Link';

export function walk(link: Link, callback: (link: Link) => void): void {
  callback(link);

  for (const dep of link.getField().dependencies(link.getObject())) {
    walk(dep.withParent(link), callback);
  }
}