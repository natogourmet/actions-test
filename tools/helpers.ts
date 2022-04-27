import { stat } from 'fs/promises';

/**
 * Returns a promise that is resolved when the file specified is created
 */
export async function waitForFile(path: string): Promise<void> {
  while (!(await fileExists(path))) {
    await sleep(300);
  }
}

/**
 * Checks if a file exists and returns a promise with a boolean
 * @returns promise that resolves to `true` if the file exists or `false` otherwise
 */
function fileExists(path: string): Promise<boolean> {
  return stat(path).then(
    () => true,
    () => false
  );
}

/**
 * Creates a promise that is resolved in `ms` milliseconds
 * @param ms milliseconds to "sleep"
 */
function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
