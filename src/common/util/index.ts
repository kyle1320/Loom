export function diff<T>(
  oldSorted: T[],
  newSorted: T[],
  onChange: (el: T, isAdd: boolean) => void,
  compare: (a: T, b: T) => number
): void {
  let i = 0, j = 0;
  while (i < oldSorted.length || j < newSorted.length) {
    let cmp = 0;

    if (i >= oldSorted.length) {
      cmp = 1;
    } else if (j >= newSorted.length) {
      cmp = -1;
    } else {
      cmp = compare(oldSorted[i], newSorted[j]);
    }

    if (cmp > 0) {
      onChange(newSorted[j], true);
      j++;
    } else if (cmp < 0) {
      onChange(oldSorted[i], false);
      i++;
    } else {
      i++;
      j++;
    }
  }
}