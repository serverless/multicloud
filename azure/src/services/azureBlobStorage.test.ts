import { AzureBlobStorage } from ".";
import {
  BlobURL,
  StorageURL,
  SharedKeyCredential,
  ContainerURL
} from "@azure/storage-blob";

jest.mock("@azure/storage-blob");

describe("Azure Blob Storage adapter should", () => {
  it("connect to blob service when initialize", () => {
    const options = {
      account: "foo",
      accountKey: "bar"
    };

    const credentials = {};
    SharedKeyCredential.prototype.create = jest.fn().mockReturnValue(credentials);
    StorageURL.newPipeline = jest.fn();

    new AzureBlobStorage(options);
    expect(SharedKeyCredential).toHaveBeenCalledWith(options.account, options.accountKey)
    expect(StorageURL.newPipeline).toHaveBeenCalled();
  });

  it("read file successfully", async () => {
    const options = {
      account: "foo",
      accountKey: "bar"
    };

    const file = new Buffer("file");

    ContainerURL.fromServiceURL = jest.fn();
    BlobURL.fromContainerURL = jest.fn().mockReturnValue({
      download: jest.fn().mockResolvedValue({
        readableStreamBody: file
      })
    });

    const sut = new AzureBlobStorage(options);
    const fileOptions = {
      container: "foo",
      path: "bar"
    };

    const result = await sut.read(fileOptions)
    expect(result).toBe(file);
  });

  it("throw an error when reading a file", async () => {
    const options = {
      account: "foo",
      accountKey: "bar"
    };

    const err = "fail";

    ContainerURL.fromServiceURL = jest.fn();
    BlobURL.fromContainerURL = jest.fn().mockReturnValue({
      download: jest.fn().mockRejectedValue(new Error(err))
    });

    const sut = new AzureBlobStorage(options);
    const fileOptions = {
      container: "foo",
      path: "bar"
    };

    await expect(sut.read(fileOptions)).rejects.toThrow(err);
  });
});
