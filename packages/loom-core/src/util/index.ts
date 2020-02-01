export interface Destroyable {
  destroy(): void;
}

export const mapRecord = <K extends string | number | symbol, T, U>(
  data: Record<K, T>,
  transform: (val: T, key: string) => U
): Record<K, U> => {
  const res: Record<K, U> = {} as Record<K, U>;

  for (const key in data) {
    res[key] = transform(data[key], key);
  }

  return res;
}