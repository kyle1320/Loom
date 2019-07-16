import Attribute from './Attribute';

export default class AttributeStore {
  private attrs: Map<string, Attribute>;

  // Track dependencies between attributes
  private outward: Map<string, Set<string>>;
  private inward: Map<string, Set<string>>;

  public constructor() {
    this.attrs = new Map();

    this.outward = new Map();
    this.inward = new Map();
  }

  public store(attr: Attribute): void {
    attr.on('change', () => {
      this.update(attr.id, attr.getLinkedAttributes());
      this.getUpstream(attr.id).forEach(a => a.emit('update'));
    });

    this.update(attr.id, attr.getLinkedAttributes());
    this.getUpstream(attr.id).forEach(a => a.emit('update'));
    this.attrs.set(attr.id, attr);
  }

  public fetch(id: string) {
    return this.attrs.get(id);
  }

  private update(from: string, to: string[]) {
    var oldOut = this.outward.get(from);

    if (!to.length && (!oldOut || !oldOut.size)) return;

    var out = new Set(to);

    // TODO: check for cycles

    if (oldOut) {
      if (eqSet(out, oldOut)) return;

      for (let n of oldOut) {
        if (!out.has(n)) {
          this.inward.get(n)!.delete(from);
        }
      }
    }

    for (let n of out) {
      if (!(oldOut && oldOut.has(n))) {
        if (this.inward.has(n)) {
          this.inward.get(n)!.add(from);
        } else {
          this.inward.set(n, new Set([from]));
        }
      }
    }

    this.outward.set(from, out);
  }

  private getUpstream(from: string): Attribute[] {
    var seen = new Set<string>();
    var res = <Attribute[]>[];

    var stack = [from];
    var curr;
    while (stack.length) {
      curr = stack.pop()!;

      if (seen.has(curr)) continue;

      seen.add(curr);

      var attr = this.fetch(curr);
      if (attr) {
        res.push(attr);
      }

      var inward = this.inward.get(curr);
      if (inward) {
        for (var n of inward) {
          stack.push(n);
        }
      }
    }

    return res;
  }
}

function eqSet<T>(as: Set<T>, bs: Set<T>) {
  if (as.size !== bs.size) return false;
  for (var a of as) if (!bs.has(a)) return false;
  return true;
}