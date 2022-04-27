export function sum<T>(items: T[], prop: keyof T): number {
  return items.reduce((prev, current) => prev + Number(current[prop]), 0);
}
