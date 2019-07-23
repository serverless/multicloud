/**
 * Ensures that the specified value is wrapped as a promise
 * @param value The value to evaluate
 */
export function ensurePromise<T>(value: T | Promise<T>) {
  const promise = value as Promise<T>;
  if (promise && promise.then && promise.catch) {
    return promise;
  }

  return Promise.resolve(value);
}
