/* -------------------------------------------------------------------------- */
/* diffArr */
/* -------------------------------------------------------------------------- */
/**
 * # Overview
 * We have two arrays of objects. We want to find the differences between them.
 * # Arguments
 * - array1 (Array): The first array of objects.
 * - array2 (Array): The second array of objects.
 * # Returns
 * - An object with two keys:
 * - `additions` (Array): An array of objects that are in `array2` but not in `array1`.
 * - `removals` (Array): An array of objects that are in `array1` but not in `array2`.
 */
export function diffArr<T extends Record<string, unknown>>(
  array1: T[],
  array2: T[],
): {
  additions: T[];
  removals: T[];
} {
  const map1 = new Map<string, T>();
  const map2 = new Map<string, T>();

  array1.forEach((obj) => {
    const normalized = normalizeAndStringify(obj);
    map1.set(normalized, obj);
  });

  array2.forEach((obj) => {
    const normalized = normalizeAndStringify(obj);
    map2.set(normalized, obj);
  });

  const removals: T[] = [];
  const additions: T[] = [];

  // Identify removals (in array1, not in array2)
  map1.forEach((value, key) => {
    if (!map2.has(key)) {
      removals.push(value);
    }
  });

  // Identify additions (in array2, not in array1)
  map2.forEach((value, key) => {
    if (!map1.has(key)) {
      additions.push(value);
    }
  });

  return { additions, removals };
}

function normalizeAndStringify<T extends Record<string, unknown>>(obj: T): string {
  const sortedObj = Object.keys(obj)
    .sort()
    .reduce<Record<string, unknown>>((result, key) => {
      result[key] = obj[key];
      return result;
    }, {});

  return JSON.stringify(sortedObj);
}
