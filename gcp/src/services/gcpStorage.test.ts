import { GcpStorage } from ".";
import { Storage } from "@google-cloud/storage";
import { Readable } from "stream";
import { convertToStream } from "@multicloud/sls-core";

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
    // Storage.prototype.bucket = jest.fn().mockImplementation((name) => ({
    //   name: name,
    //   file: jest.fn(),
    // }));

    // Storage.Bucket.prototype.file = jest.fn().mockReturnValue({
    //   promise: jest.fn().mockResolvedValue({}),
    // });

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

  it("use gcp createWriteStream ", async () => {
    const mockFile123 = jest.fn().mockReturnValue({
      createWriteStream: jest.fn().mockResolvedValue({
        on: jest.fn(),
      }),
    });
    Storage.prototype.bucket = jest.fn().mockReturnValue({
      file: mockFile123,
    });

    const sut = new GcpStorage();
    // Storage.prototype.putObject = jest.fn().mockReturnValue({
    //   promise: jest.fn().mockResolvedValue({}),
    // });

    const readableBody = new Readable();
    readableBody.push(input.body);
    readableBody.push(null);

    const expectedParams = {
      ...input.options,
      Bucket: input.container,
      Key: input.path,
      Body: readableBody,
      ContentLength: readableBody.readableLength,
    };

    await sut.write(input);
    expect(Storage.Bucket.prototype.file).toHaveBeenCalledWith(expectedParams);
  });

  it("use S3 putObject with Buffer body", async () => {
    const sut = new GcpStorage();
    Storage.S3.prototype.putObject = jest.fn().mockReturnValue({
      promise: jest.fn().mockResolvedValue({}),
    });

    const buffer = Buffer.from(input.body);

    const inputBuffer = {
      ...input,
      body: buffer,
    };

    const readableBody = convertToStream(buffer);
    const gcpParams = {
      Bucket: inputBuffer.container,
      Key: inputBuffer.path,
      Body: readableBody,
      CacheControl: "no-cache",
      ContentType: "application/json",
      ContentLength: readableBody.readableLength,
    };

    await sut.write(inputBuffer);
    expect(Storage.S3.prototype.putObject).toHaveBeenCalledWith(gcpParams);
  });

  // it("use S3 putObject with Stream body", async () => {
  //   const sut = new GcpStorage();
  //   Storage.S3.prototype.putObject = jest.fn().mockReturnValue({
  //     promise: jest.fn().mockResolvedValue({}),
  //   });

  //   const readableBody = new Readable();
  //   readableBody.push(input.body);
  //   readableBody.push(null);

  //   const inputStream = {
  //     ...input,
  //     body: readableBody,
  //   };

  //   const expectedParams = {
  //     ...inputStream.options,
  //     Bucket: inputStream.container,
  //     Key: inputStream.path,
  //     Body: readableBody,
  //     ContentLength: readableBody.readableLength,
  //   };

  //   await sut.write(inputStream);
  //   expect(Storage.S3.prototype.putObject).toHaveBeenCalledWith(expectedParams);
  // });

  // it("throw error when fail", async () => {
  //   Storage.S3.prototype.putObject = jest.fn().mockReturnValue({
  //     promise: jest.fn().mockRejectedValue(new Error("fail")),
  //   });

  //   const sut = new GcpStorage();
  //   await expect(sut.write(input)).rejects.toThrow("fail");
  // });

  it("return data on success", async () => {
    const response = {
      VersionId: "1.0",
      ETag: "foo",
    };

    Storage.prototype.putObject = jest.fn().mockReturnValue({
      promise: jest.fn().mockResolvedValue(response),
    });

    const sut = new GcpStorage();
    const expected = {
      version: response.VersionId,
      eTag: response.ETag,
    };

    expect(await sut.write(input)).toEqual(expected);
  });
});
