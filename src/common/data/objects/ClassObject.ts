import ObjectDB from '../db/ObjectDB';
import LObject, { IllegalFieldKeyError } from './LObject';
import ComputedField from '../fields/ComputedField';

export default class ClassObject implements LObject {
  public readonly fields: LObject.Fields<ComputedField> = {};

  public constructor(
    public readonly db: ObjectDB,
    fields: { [id: string]: ComputedField },
    public readonly id: string,
    public readonly parent: ClassObject | null = null,
  ) {
    this.fields[LObject.TypeField] = id;

    for (const key in fields) {
      if (!key.endsWith('()')) {
        throw new IllegalFieldKeyError('Computed field keys must end with ()');
      }

      const lower = key.toLowerCase();

      this.fields[lower] = fields[key];
    }
  }
}