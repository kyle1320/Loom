import Value from './Value';

// https://github.com/microsoft/TypeScript/issues/11315#issuecomment-265231028
class WritableValue<T> extends Value<T> {}
interface WritableValue<T> {
  set(value: T): boolean;
}

export default WritableValue;