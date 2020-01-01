import Field from '../fields/Field';
import ObjectDB from '../db/ObjectDB';

export class IllegalFieldKeyError extends Error {}

namespace LObject {
  export const hasOwnField = (obj: LObject, key: string): boolean => {
    return Object.prototype.hasOwnProperty.call(obj.fields, key.toLowerCase());
  }

  export const typeOf = (obj: LObject): string | undefined => {
    return obj.fields[LObject.TypeField];
  }

  export const isInstance = (
    obj: LObject,
    parent: string | LObject
  ): boolean => {
    if (typeof parent === 'string') {
      const par = obj.db.getObject(parent);
      if (!par) return false;
      parent = par;
    }

    // eslint-disable-next-line no-prototype-builtins
    return parent.fields.isPrototypeOf(obj.fields);
  }

  export const TypeField = Symbol('type');
  export type Fields<F extends Field = Field> =
    { [S in string]?: F } &
    { [LObject.TypeField]?: string }
}

interface LObject {
  readonly id: string;
  readonly parent: LObject | null;
  readonly db: ObjectDB;
  readonly fields: LObject.Fields;
}

export default LObject