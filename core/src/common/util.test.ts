import { ensurePromise } from "./util";

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
});
