import { NodeCallback } from './types';

export function promisify<A>(fn: (cb: NodeCallback<Error, A>) => void): Promise<A> {
  return new Promise((resolve, reject) => {
    fn((err, callbackArgs) => {
      if (err) return reject(err);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      resolve(callbackArgs!);
    });
  });
}
