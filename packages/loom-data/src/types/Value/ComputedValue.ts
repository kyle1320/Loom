import Value from './Value';

export default abstract class ComputedValue<T> extends Value<T> {
  public abstract destroy(): void
}