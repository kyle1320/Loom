import List from './List';
import { Destroyable } from '../../util';

export default abstract class ComputedList<T>
  extends List<T>
  implements Destroyable {

  public abstract destroy(): void;
}