import LObject from './LObject';

export default class ObjectStore {
  private objects: Map<string, LObject>;

  public constructor() {
    this.objects = new Map();
  }

  public *all() {
    yield* this.objects.values();
  }

  public *allInDependencyOrder() {
    var seen = new Set();

    function* visit(obj: LObject): IterableIterator<LObject> {
      if (seen.has(obj)) return;

      seen.add(obj);

      if (obj.parent) yield* visit(obj.parent);

      yield obj;
    }

    for (var obj of this.all()) {
      yield* visit(obj);
    }
  }

  public store(object: LObject): void {
    this.objects.set(object.id, object);
  }

  public fetch(id: string): LObject | undefined {
    return this.objects.get(id);
  }
}