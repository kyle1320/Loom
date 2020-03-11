import Dictionary from './Dictionary';
import { Destroyable } from '../../util';

export default abstract class ComputedDictionary<T>
  extends Dictionary<T>
  implements Destroyable {

  public abstract destroy(): void;
}