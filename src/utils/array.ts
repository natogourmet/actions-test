/**
 * Creates a Sort Function to be used in Array.sort(fn) that sorts the elements by the property specified
 * @param propertyName name of the property to use in order to sort
 * @param descending flag indicating whether it should sort in descending or ascending (default) order
 * @returns the sort Fn
 */
export function sortFnByProperty<T>(propertyName: keyof T, descending: boolean = false): (a: T, b: T) => number {
  const mult = descending ? -1 : 1;
  return function (a: T, b: T): number {
    if (a[propertyName] < b[propertyName]) return -1 * mult;
    else if (a[propertyName] > b[propertyName]) return 1 * mult;
    return 0;
  };
}

/**
 * Creates a predicate that returns `true` if the property of the object is **truthy**.
 *
 * It returns `false` otherwise.
 */
export function filterByTruthy<T>(propertyName: keyof T): (item: T) => boolean {
  return (item: T) => Boolean(item[propertyName]);
}

/**
 * Creates a predicate that returns `true` if the property of the object has the specified value.
 *
 * It returns `false` otherwise.
 */
export function filterByProperty<T>(propertyName: keyof T, value: unknown): (item: T) => boolean {
  return (item: T) => item[propertyName] === value;
}
