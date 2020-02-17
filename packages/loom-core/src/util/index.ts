export interface Destroyable {
  destroy(): void;
}

export const doAll = (...callbacks: (() => void)[]): () => void => {
  return () => callbacks.forEach(cb => cb());
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

export const mapRecordKeys = <T>(
  data: Record<string, T>,
  transformKey: (key: string) => string
): Record<string, T> => {
  const res: Record<string, T> = {};

  for (const key in data) {
    res[transformKey(key)] = data[key];
  }

  return res;
}