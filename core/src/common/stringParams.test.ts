import { StringParams } from "./stringParams";

describe("String Params", () => {
  it("entries can be retieved in any case", () => {
    const expected = "ABC123";

    const params = new StringParams();
    params.set("Authorization", expected);

    const lowerCase = params.get("authorization");
    const upperCase = params.get("AUTHORIZATION");
    const mixedCase = params.get("AuThOrIzAtIoN");

    expect(lowerCase).toBe(expected);
    expect(upperCase).toBe(expected);
    expect(mixedCase).toBe(expected);
  });

  it("entries can be set using chaining", () => {
    const params = new StringParams();
    params
      .set("a", 1)
      .set("b", 2)
      .set("c", 3);

    const a = params.get("A");
    const b = params.get("B");
    const c = params.get("C");

    expect(a).toEqual(1);
    expect(b).toEqual(2);
    expect(c).toEqual(3);
  });

  it("can determine whether a key exists", () => {
    const params = new StringParams();
    params.set("a", 1);

    expect(params.has("A")).toBe(true);
  });

  it("entries can be deleted using any case", () => {
    const params = new StringParams();
    params.set("authorization", "test");
    params.delete("Authorization");

    const actual = params.get("Authorization");
    expect(actual).toBeUndefined();
  });

  it("Can be initialized from an interable", () => {
    const values: Iterable<[string, any]> = [["A", 1], ["B", 2], ["c", 3]];
    const params = new StringParams(values);

    const a = params.get("a");
    const b = params.get("b");
    const c = params.get("C");

    expect(a).toEqual(1);
    expect(b).toEqual(2);
    expect(c).toEqual(3);
  });

  it("can be initialized from an object", () => {
    const entries = {
      a: 1,
      B: 2,
      c: 3
    };

    const params = new StringParams(entries);

    const a = params.get("A");
    const b = params.get("b");
    const c = params.get("c");

    expect(a).toBe(entries.a);
    expect(b).toBe(entries.B);
    expect(c).toBe(entries.c);
  });

  it("serializes to JSON correctly", () => {
    const entries = {
      a: 1,
      b: 2,
      c: 3,
    };

    const params = new StringParams(entries);
    expect(JSON.stringify(params)).toEqual(JSON.stringify(entries));
  });

  it("serializes to lowercase keys correctly", () => {
    const original: any = {
      A: 1,
      B: 2,
      C: 3,
    };

    const expected = {
      a: 1,
      b: 2,
      c: 3,
    };

    const params = new StringParams(original);
    expect(JSON.stringify(params)).toEqual(JSON.stringify(expected));
  });
});
