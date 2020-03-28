import List from './List';

export default class PrependList<T> extends List<T> {
  public constructor(prepend: Readonly<T[]>, sourceList: List<T>) {
    super(prepend);
    const count = prepend.length;

    this.destroy.do(
      sourceList.watch(
        (index, value) => this.add(value, index + count),
        (index) => this.removeIndex(index - count)
      )
    );
  }
}