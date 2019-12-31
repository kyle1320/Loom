import Project from '../Project';
import LObject, { IllegalFieldKeyError } from './LObject';
import ComputedField from '../fields/ComputedField';

export default class ClassObject implements LObject {
  public readonly fields: { [id: string]: ComputedField } = {};

  public constructor(
    public readonly project: Project,
    fields: { [id: string]: ComputedField },
    public readonly parent: ClassObject | null = null,
    public readonly id = project.freshId()
  ) {
    for (const key in fields) {
      if (!key.endsWith('()')) {
        throw new IllegalFieldKeyError('Computed field keys must end with ()');
      }

      const lower = key.toLowerCase();

      this.fields[lower] = fields[key];
    }
  }
}