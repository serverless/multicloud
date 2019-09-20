import { Stream, Readable, PassThrough } from "stream";
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
export async function convertToStream(input: string | Buffer | Stream | Uint8Array): Promise<Readable> {
  Guard.null(input, "input");

  if (input instanceof PassThrough) {
    console.log("ES PASSTHROUGH");
    let chunk = "";
    input = await new Promise(res => {
      (input as PassThrough).on("data", function (data) {
        chunk += data;
      }).on("finish", function () {
        res(chunk);
      });
    });
  }

  if (input instanceof Uint8Array) {
    input = Buffer.from(input.buffer);
  }

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
