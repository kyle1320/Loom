export const doAll = (
  ...callbacks: (null | undefined | (() => void))[]
): () => void => {
  return () => callbacks.forEach(cb => cb && cb());
}

export const mapRecord = <
  T extends Record<string, unknown>,
  U extends Record<keyof T, unknown>
>(
  data: T,
  transform: <K extends keyof T>(val: T[K], key: K) => U[K]
): U => {
  const res: U = {} as U;

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