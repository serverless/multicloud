import { GcpStorage } from ".";
import { Storage } from "@google-cloud/storage";
import { Readable, PassThrough } from "stream";

jest.mock("@google-cloud/storage");

describe("Gcp storage when initialize should", () => {
  it("creates an instance", () => {
    new GcpStorage();
    expect(Storage).toHaveBeenCalled();
  });
});

describe("gcp storage when call read should", () => {
  it("use read object", async () => {
    const mockFile = jest.fn().mockReturnValue({
      createReadStream: jest.fn().mockResolvedValue(),
    });
    Storage.prototype.bucket = jest.fn().mockReturnValue({
      promise: jest.fn().mockResolvedValue(),
      file: mockFile,
    });
    const sut = new GcpStorage();

    await sut.read({ container: "foo", path: "bar" });
    expect(Storage.prototype.bucket).toHaveBeenCalledWith("foo");
  });

  it("throw error when fail", async () => {
    const mockFile = jest.fn().mockReturnValue({
      createReadStream: jest.fn().mockRejectedValue(new Error("fail")),
    });
    Storage.prototype.bucket = jest.fn().mockReturnValue({
      file: mockFile,
    });
    const sut = new GcpStorage();
    await expect(sut.read({ container: "", path: "" })).rejects.toThrow("fail");
  });

  it("return stream on success", async () => {
    const file = new Buffer("file");

    const mockFile = jest.fn().mockReturnValue({
      createReadStream: jest.fn().mockResolvedValue(file),
    });
    Storage.prototype.bucket = jest.fn().mockReturnValue({
      file: mockFile,
    });
    const sut = new GcpStorage();
    const data = await sut.read({ container: "foo", path: "bar" });
    expect(data).toBe(file);
  });
});

describe("gcp storage when call write should", () => {
  const input = {
    container: "foo",
    path: "bar",
    body: "test",
    options: {
      CacheControl: "no-cache",
      ContentType: "application/json",
    },
  };
  const readableBody = new Readable();
  readableBody.push(input.body);
  readableBody.push(null);

  it("use gcp createWriteStream ", async () => {
    const mockWriteable = new PassThrough();

    const mockFile = jest.fn().mockReturnValue({
      createWriteStream: jest.fn().mockReturnValue(mockWriteable),
      getMetadata: jest.fn().mockResolvedValue([{}]),
    });

    Storage.prototype.bucket = jest.fn().mockReturnValue({
      file: mockFile,
    });

    const sut = new GcpStorage();

    const expectedParams = {
      ...input.options,
      Bucket: input.container,
      Key: input.path,
      Body: readableBody,
      ContentLength: readableBody.readableLength,
    };

    await sut.write(input);
    expect(Storage.prototype.bucket).toHaveBeenCalledWith(
      expectedParams.Bucket
    );
  });

  it("throw error when fail", async () => {
    const mockWriteable = new PassThrough();
    mockWriteable.end();
    const mockFile = jest.fn().mockReturnValue({
      createWriteStream: jest.fn().mockReturnValue(mockWriteable),
      getMetadata: jest.fn().mockResolvedValue({}),
    });
    Storage.prototype.bucket = jest.fn().mockReturnValue({
      file: mockFile,
    });

    const sut = new GcpStorage();
    await expect(sut.write(input)).rejects.toThrow("write after end");
  });

  it("return data on success", async () => {
    const response = [{
      generation: "1.0",
      etag: "foo",
    }];

    const mockWriteable = new PassThrough();
    const mockFile = jest.fn().mockReturnValue({
      createWriteStream: jest.fn().mockReturnValue(mockWriteable),
      getMetadata: jest.fn().mockResolvedValue(response),
    });

    Storage.prototype.bucket = jest.fn().mockReturnValue({
      file: mockFile,
    });

    const sut = new GcpStorage();
    const expected = {
      version: response[0].generation,
      eTag: response[0].etag,
    };

    expect(await sut.write(input)).toEqual(expected);
  });
});
