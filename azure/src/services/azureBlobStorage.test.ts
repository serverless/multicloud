import { AzureBlobStorage } from ".";
import {
  BlobURL,
  StorageURL,
  SharedKeyCredential,
  ContainerURL,
  BlockBlobURL,
  uploadStreamToBlockBlob
} from "@azure/storage-blob";
import { WriteBlobOptions } from "@multicloud/sls-core";

jest.mock("@azure/storage-blob");

describe("Azure Blob Storage adapter should", () => {
  const response = {
    eTag: "foo",
    version: "1.0"
  };

  it("connect to blob service when initialize", () => {
    const OLD_ENV = process.env;

    const account = "foo";
    const accountKey = "bar";

    process.env.azAccount = account;
    process.env.azAccountKey = accountKey;

    const credentials = {};
    SharedKeyCredential.prototype.create = jest.fn().mockReturnValue(credentials);
    StorageURL.newPipeline = jest.fn();

    new AzureBlobStorage();
    expect(SharedKeyCredential).toBeCalledWith(account, accountKey)
    expect(StorageURL.newPipeline).toHaveBeenCalled();

    process.env = OLD_ENV;
  });

  it("read file successfully", async () => {
    const file = new Buffer("file");

    ContainerURL.fromServiceURL = jest.fn();
    BlobURL.fromContainerURL = jest.fn().mockReturnValue({
      download: jest.fn().mockResolvedValue({
        readableStreamBody: file
      })
    });

    const sut = new AzureBlobStorage();
    const fileOptions = {
      container: "foo",
      path: "bar"
    };

    const result = await sut.read(fileOptions)
    expect(result).toBe(file);
  });

  it("throw an error when reading a file", async () => {
    const err = "fail";

    ContainerURL.fromServiceURL = jest.fn();
    BlobURL.fromContainerURL = jest.fn().mockReturnValue({
      download: jest.fn().mockRejectedValue(new Error(err))
    });

    const sut = new AzureBlobStorage();
    const fileOptions = {
      container: "foo",
      path: "bar"
    };

    await expect(sut.read(fileOptions)).rejects.toThrow(err);
  });

  it("write a string file successfully", async () => {
    ContainerURL.fromServiceURL = jest.fn();
    BlockBlobURL.fromContainerURL = jest.fn()

    uploadStreamToBlockBlob.mockResolvedValue(response);

    const sut = new AzureBlobStorage();
    const writeOptions: WriteBlobOptions = {
      container: "foo",
      path: "bar",
      body: "hotSpotsBody"
    };

    expect(await sut.write(writeOptions)).toEqual(response);
  });

  it("write a stream file successfully", async () => {
    ContainerURL.fromServiceURL = jest.fn();
    BlockBlobURL.fromContainerURL = jest.fn();

    uploadStreamToBlockBlob.mockResolvedValue(response);

    var Readable = require("stream").Readable;
    var stream = new Readable;
    stream.push("hotSpotsBody");
    stream.push(null);

    const sut = new AzureBlobStorage();
    const writeOptions: WriteBlobOptions = {
      container: "foo",
      path: "bar",
      body: stream
    };

    expect(await sut.write(writeOptions)).toEqual(response);
  });

  it("write a buffer file successfully", async () => {
    ContainerURL.fromServiceURL = jest.fn();
    BlockBlobURL.fromContainerURL = jest.fn();

    uploadStreamToBlockBlob.mockResolvedValue(response);

    const buffer = Buffer.from("hotSpotBody");

    const sut = new AzureBlobStorage();
    const writeOptions: WriteBlobOptions = {
      container: "foo",
      path: "bar",
      body: buffer
    };

    expect(await sut.write(writeOptions)).toEqual(response);
  });

  it("throw an error when writing a file", async () => {
    const err = "fail";

    ContainerURL.fromServiceURL = jest.fn();
    BlockBlobURL.fromContainerURL = jest.fn()

    uploadStreamToBlockBlob.mockRejectedValue(new Error(err));

    const sut = new AzureBlobStorage();
    const writeOptions: WriteBlobOptions = {
      container: "foo",
      path: "bar",
      body: "hotSpotsBody"
    };

    await expect(sut.write(writeOptions)).rejects.toThrow(err);
  });

});
