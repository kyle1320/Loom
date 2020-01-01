import Field from '../fields/Field';
import Project from '../Project';

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
      const par = obj.project.getObject(parent);
      if (!par) return false;
      parent = par;
    }

    // eslint-disable-next-line no-prototype-builtins
    return parent.fields.isPrototypeOf(obj.fields);
  }

  export const TypeField = Symbol('type');
  export type Fields<F extends Field = Field> =
    { [key: string]: F } &
    { [LObject.TypeField]?: string }
}

interface LObject {
  readonly id: string;
  readonly parent: LObject | null;
  readonly project: Project;
  readonly fields: LObject.Fields;
}

export default LObject