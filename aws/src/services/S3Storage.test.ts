import { S3Storage } from ".";
import AWS from "aws-sdk";
import { Stream, Readable } from "stream";
import { convertToStream } from "@multicloud/sls-core";

jest.mock("aws-sdk");

describe("aws storage when initialize should", () => {
  it("creates s3 instance", () => {
    new S3Storage();
    expect(AWS.S3).toHaveBeenCalled();
  });
});

describe("aws storage when call read should", () => {
  it("use S3 getObject", async () => {
    AWS.S3.prototype.getObject = jest.fn().mockReturnValue({
      createReadStream: jest.fn().mockReturnValue()
    });

    const sut = new S3Storage();
    const options = {
      container: "foo",
      path: "bar"
    };

    await sut.read(options);

    expect(AWS.S3.prototype.getObject).toHaveBeenCalledWith({
      Bucket: options.container,
      Key: options.path
    });
  });

  it("fail when using S3 getObject", async () => {
    AWS.S3.prototype.getObject = jest.fn().mockReturnValue(null);

    const sut = new S3Storage();
    const options = {
      container: "",
      path: ""
    };

    await expect(sut.read(options)).rejects.toThrow(expect.any(Error));
  });

  it("throw error when createReadStream method fails", async () => {
    AWS.S3.prototype.getObject = jest.fn().mockReturnValue({
      createReadStream: jest.fn().mockRejectedValue(new Error("fail"))
    });

    const sut = new S3Storage();
    const options = {
      container: "foo",
      path: "bar"
    };

    await expect(sut.read(options)).rejects.toThrow(expect.any(Error));
  });

  it("emit error event if the stream fails", async () => {
    AWS.S3.prototype.getObject = jest.fn().mockReturnValue({
      createReadStream: jest.fn().mockImplementation(() => {
        const file = new Readable();
        setImmediate(() => file.emit("error", new Error("fail")));
        return Promise.resolve(file);
      })
    });

    const sut = new S3Storage();
    const options = {
      container: "foo",
      path: "bar"
    };

    const result = await sut.read(options);

    result.on("error", error => {
      expect(error).toEqual(expect.any(Error));
    });
  });

  it("return stream on success", async () => {
    const file = convertToStream("file");
    AWS.S3.prototype.getObject = jest.fn().mockReturnValue({
      createReadStream: jest.fn().mockReturnValue(file)
    });

    const sut = new S3Storage();
    const options = {
      container: "foo",
      path: "bar"
    };

    const result = await sut.read(options);

    expect(result).toEqual(file);
    expect(result).toBeInstanceOf(Stream);
  });
});

describe("aws storage when call write should", () => {
  const input = {
    container: "foo",
    path: "bar",
    body: "test",
    options: {
      CacheControl: "no-cache",
      ContentType: "application/json"
    }
  };

  it("use S3 putObject with string body", async () => {
    const sut = new S3Storage();
    AWS.S3.prototype.putObject = jest.fn().mockReturnValue({
      promise: jest.fn().mockResolvedValue({})
    });

    const readableBody = new Readable();
    readableBody.push(input.body);
    readableBody.push(null);

    const expectedParams = {
      ...input.options,
      Bucket: input.container,
      Key: input.path,
      Body: readableBody,
      ContentLength: readableBody.readableLength || (readableBody as any)._readableState.length
    };

    await sut.write(input);
    expect(AWS.S3.prototype.putObject).toHaveBeenCalledWith(expectedParams);
  });

  it("use S3 putObject with Buffer body", async () => {
    const sut = new S3Storage();
    AWS.S3.prototype.putObject = jest.fn().mockReturnValue({
      promise: jest.fn().mockResolvedValue({})
    });

    const buffer = Buffer.from(input.body);

    const inputBuffer = {
      ...input,
      body: buffer
    };

    const readableBody = convertToStream(buffer);
    const awsParams = {
      Bucket: inputBuffer.container,
      Key: inputBuffer.path,
      Body: readableBody,
      CacheControl: "no-cache",
      ContentType: "application/json",
      ContentLength: readableBody.readableLength || (readableBody as any)._readableState.length
    }

    await sut.write(inputBuffer);
    expect(AWS.S3.prototype.putObject).toHaveBeenCalledWith(awsParams);
  });

  it("use S3 putObject with Stream body", async () => {
    const sut = new S3Storage();
    AWS.S3.prototype.putObject = jest.fn().mockReturnValue({
      promise: jest.fn().mockResolvedValue({})
    });

    const readableBody = new Readable();
    readableBody.push(input.body);
    readableBody.push(null);

    const inputStream = {
      ...input,
      body: readableBody
    };

    const expectedParams = {
      ...inputStream.options,
      Bucket: inputStream.container,
      Key: inputStream.path,
      Body: readableBody,
      ContentLength: readableBody.readableLength || (readableBody as any)._readableState.length
    };

    await sut.write(inputStream);
    expect(AWS.S3.prototype.putObject).toHaveBeenCalledWith(expectedParams);
  });

  it("throw error when fail", async () => {
    AWS.S3.prototype.putObject = jest.fn().mockReturnValue({
      promise: jest.fn().mockRejectedValue(new Error("fail"))
    });

    const sut = new S3Storage();
    await expect(sut.write(input)).rejects.toThrow("fail");
  });

  it("return data on success", async () => {
    const response = {
      VersionId: "1.0",
      ETag: "foo"
    };

    AWS.S3.prototype.putObject = jest.fn().mockReturnValue({
      promise: jest.fn().mockResolvedValue(response)
    });

    const sut = new S3Storage();
    const expected = {
      version: response.VersionId,
      eTag: response.ETag
    }

    expect(await sut.write(input)).toEqual(expected);
  });
});
