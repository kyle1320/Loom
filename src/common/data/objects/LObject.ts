import Field from '../fields/Field';
import Project from '../Project';

interface LObject {
  readonly id: string;
  readonly parent: LObject | null;
  readonly project: Project;
  readonly fields: { [key: string]: Field };
}

export class IllegalFieldKeyError extends Error {}

namespace LObject {
  export const hasOwnField = (obj: LObject, key: string): boolean => {
    return Object.prototype.hasOwnProperty.call(obj.fields, key.toLowerCase());
  }

  export const baseId = (obj: LObject): string => {
    return obj.parent ? baseId(obj.parent) : obj.id;
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
}

export default LObject