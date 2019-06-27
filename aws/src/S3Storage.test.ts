import { S3Storage } from "./S3Storage";
import AWS from "aws-sdk";

jest.mock("aws-sdk");

describe("aws storage when initialize should", () => {

  it("creates s3 instance", () => {
    const sut = new S3Storage();
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
    const file = new Buffer("file")
    AWS.S3.prototype.getObject = jest.fn().mockReturnValue({
      promise: jest.fn().mockResolvedValue({ Body: file })
    });
    const sut = new S3Storage();
    const data = await sut.read({ container: "foo", path: "bar" })
    expect(data).toBe(file);
  });
});
