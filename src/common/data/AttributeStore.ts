import Attribute from './Attribute';
import IllegalArgumentKeyError from '../errors/IllegalArgumentKeyError';

const validityRegex = /^[a-zA-Z0-9_.-]+$/;

export default class AttributeStore {
  private attrs: Map<string, Attribute>;

  public constructor() {
    this.attrs = new Map();
  }

  public store(attr: Attribute): void {
    if (!validityRegex.test(attr.key)) {
      throw new IllegalArgumentKeyError(attr.key);
    }

    this.attrs.set(attr.id, attr);
  }

  public fetch(id: string) {
    return this.attrs.get(id);
  }
}