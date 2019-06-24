import { Storage } from "./storage";
import AWS, { S3 } from "aws-sdk";
import { Stream } from "stream";

jest.mock("aws-sdk");

describe("aws storage when initialize", () => {
  const options = {};
  it("uses s3 loadFromPath", () => {
    const sut = new Storage(options);
    expect(AWS.config.loadFromPath).toHaveBeenCalledWith(options);
  });

  it("creates s3 instance", () => {
    const sut = new Storage(options);
    expect(AWS.S3).toHaveBeenCalled();
  });
});

describe("aws storage when call read", () => {
  const options = {};
  it("uses S3 getObject", async () => {
    const sut = new Storage(options);
    AWS.S3.prototype.getObject = jest.fn().mockReturnValue({
      promise: jest.fn().mockResolvedValue({})
    });

    await sut.read({ container: "foo", path: "bar" });
    expect(AWS.S3.prototype.getObject).toHaveBeenCalledWith({
      Bucket: "foo",
      Key: "bar"
    });
  });

  it.skip("throw error when fail", async () => {
    AWS.S3.prototype.getObject = jest.fn().mockReturnValue({
      promise: jest.fn().mockRejectedValue(new Error("fail"))
    });

    const sut = new Storage(options);
    expect(
      async () => await sut.read({ container: "", path: "" })
    ).rejects.toEqual("fail");
  });

  it("return stream on success", async () => {
    const file = new Buffer("file")
    AWS.S3.prototype.getObject = jest.fn().mockReturnValue({
      promise: jest.fn().mockResolvedValue({
        Body: file
      })
    });
    const sut = new Storage(options);
    const data = await sut.read({ container: "foo", path: "bar" })
    expect(data).toBe(file);
  });
});
