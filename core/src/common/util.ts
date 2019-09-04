import { Stream, Readable } from "stream";
import { Guard } from "./guard";

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

/**
 * Converts the input to Stream
 * @param input Data to be converted to Stream
 */
export function convertToStream(input: string | Buffer | Stream): Readable {
  Guard.null(input, "input");

  let readable;

  if (input instanceof Stream.Readable) {
    readable = input;
  } else if (input instanceof Buffer || typeof input === "string") {
    readable = new Readable();
    readable.push(input);
    readable.push(null);
  } else {
    throw new Error("input type not supported");
  }

  return readable;
}
