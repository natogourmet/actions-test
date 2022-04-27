export function isUndefined(value: unknown): value is undefined {
  return value === undefined;
}

export function isDefined(value: unknown): boolean {
  return !isUndefined(value);
}
