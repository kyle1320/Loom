import List from './List';
import WritableList from './WritableList';

export default class FilteredList<T> extends List<T> {
  public constructor(
    sourceList: WritableList<T>,
    predicate: (val: T, index: number) => boolean
  ) {
    super();

    const include: boolean[] = [];

    function filteredIndex(index: number): number {
      let res = 0;
      for (let i = 0; i < index; i++) {
        if (include[i]) res++;
      }
      return res;
    }

    this.destroy.do(
      sourceList.watch(
        (index, value) => {
          const b = predicate(value, index);
          include.splice(index, 0, b);
          b && this.add(value, filteredIndex(index));
        },
        (index) => {
          this.removeIndex(filteredIndex(index));
          include.splice(index, 1);
        }
      )
    );
  }
}