import { ensurePromise, convertToStream } from "./util";
import { Readable } from "stream";

describe("util", () => {
  describe("ensurePromise", () => {
    it("returns the promise if value is a promise", async () => {
      const expected = "value";
      const promise = Promise.resolve(expected);
      const actual = await ensurePromise(promise);

      expect(actual).toBe(expected);
    });

    it("returns a wrapped promise if the value is a static value", async () => {
      const expected = "value";
      const actual = await ensurePromise(expected);

      expect(actual).toBe(expected);
    });
  });
  describe("convertToStream", () => {
    const input = "foo";

    const streamToString = (stream, cb) => {
      const chunks = [];
      stream.on("data", (chunk) => {
        chunks.push(chunk.toString());
      });
      stream.on("end", () => {
        cb(chunks.join(""));
      });

      return chunks;
    }

    it("receives a string and returns a stream", (done) => {
      const actualStream = convertToStream(input);
      streamToString(actualStream, (result) => {
        expect(result).toEqual(input);
        expect(actualStream).toBeInstanceOf(Readable);
        done();
      });
    });

    it("receives a Buffer and returns a stream", (done) => {
      const actualStream = convertToStream(Buffer.from(input));
      streamToString(actualStream, (result) => {
        expect(result).toEqual(input);
        expect(actualStream).toBeInstanceOf(Readable);
        done();
      });
    });

    it("receives and returns a Stream", (done) => {
      let inputStream = new Readable;
      inputStream.push(input);
      inputStream.push(null);
      const actualStream = convertToStream(inputStream);
      streamToString(actualStream, (result) => {
        expect(result).toEqual(input);
        expect(actualStream).toBeInstanceOf(Readable);
        done();
      });
    });

    it("throws an exception when input value is not string/Buffer/Stream", (done) => {
      const value = 100
      expect(() => convertToStream(value as unknown as string)).toThrowError();
      done();
    });

    it("throws an exception if input is null", (done) => {
      expect(() => convertToStream(null)).toThrowError();
      done();
    });
  });
});
