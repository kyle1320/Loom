import WritableValue from './WritableValue';
import Destroyable from '../Destroyable';
import { mapRecord } from '../../util';

type WritableValues<T extends Record<string, unknown>> = {
  [K in keyof T]: WritableValue<T[K]>
}

export default class ParsedValue<T extends Record<string, unknown>>
implements Destroyable {
  public readonly data: WritableValues<T>;
  public readonly destroy = Destroyable.make();

  public constructor(
    public readonly source: WritableValue<string>,
    parse: (str: string) => T,
    stringify: (data: T) => string
  ) {
    this.data = mapRecord(
      parse(source.get()),
      v => new WritableValue(v).on('change', () => {
        source.set(stringify(mapRecord(this.data, x => x.get())));
      })
    );

    this.destroy.do(source.onOff('change', value => {
      const data = parse(value);
      for (const key in data) {
        this.data[key].set(data[key]);
      }
    }));
  }
}