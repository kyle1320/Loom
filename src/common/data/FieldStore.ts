import Field from './Field';
import IllegalFieldKeyError from '../errors/IllegalFieldKeyError';

const validityRegex = /^[a-zA-Z0-9_.-]+$/;

export default class FieldStore {
  private attrs: Map<string, Field>;

  public constructor() {
    this.attrs = new Map();
  }

  public store(attr: Field): void {
    if (!validityRegex.test(attr.key)) {
      throw new IllegalFieldKeyError(attr.key);
    }

    this.attrs.set(attr.id, attr);
  }

  public fetch(id: string) {
    return this.attrs.get(id);
  }
}