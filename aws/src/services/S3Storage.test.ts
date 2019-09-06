import { S3Storage } from ".";
import AWS from "aws-sdk";
import { Readable } from "stream";
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
    const sut = new S3Storage();
    AWS.S3.prototype.getObject = jest.fn().mockReturnValue({
      promise: jest.fn().mockResolvedValue({})
    });

    await sut.read({ container: "foo", path: "bar" });
    expect(AWS.S3.prototype.getObject).toHaveBeenCalledWith({
      Bucket: "foo",
      Key: "bar"
    });
  });

  it("throw error when fail", async () => {
    AWS.S3.prototype.getObject = jest.fn().mockReturnValue({
      promise: jest.fn().mockRejectedValue(new Error("fail"))
    });

    const sut = new S3Storage();
    await expect(sut.read({ container: "", path: "" })).rejects.toThrow("fail");
  });

  it("return stream on success", async () => {
    const file = new Buffer("file");
    AWS.S3.prototype.getObject = jest.fn().mockReturnValue({
      promise: jest.fn().mockResolvedValue({ Body: file })
    });
    const sut = new S3Storage();
    const data = await sut.read({ container: "foo", path: "bar" });
    expect(data).toBe(file);
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
      ContentLength: readableBody.readableLength
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
      ContentLength: readableBody.readableLength
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
      ContentLength: readableBody.readableLength
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
