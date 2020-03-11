import Value from './Value';

export default class WritableValue<T> extends Value<T> {
  public set(value: T): boolean {
    return super.set(value);
  }
}