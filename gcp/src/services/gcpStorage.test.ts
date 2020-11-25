import { GcpStorage } from ".";
import { Storage } from "@google-cloud/storage";
import { Readable, Writable } from "stream";
import { convertToStream } from "@multicloud/sls-core";
import stream from "stream";
import { PassThrough } from "stream";

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

  it("use gcp createWriteStream ", async () => {

    const readableBody = new Readable();
    readableBody.push(input.body);
    readableBody.push(null);
    const mockWriteable = new PassThrough()


    const mockFile = jest.fn().mockReturnValue({
      createWriteStream: jest.fn().mockReturnValue(mockWriteable),
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

  // it("use S3 putObject with Buffer body", async () => {
  //   const mockedStream = new stream.Writable();
  //   mockedStream._write = function (size) {
  //     /* do nothing */
  //   };

  //   // myModule.functionIWantToTest(mockedStream); // has .on() listeners in it

  //   mockedStream.emit("data", "Hello data!");
  //   mockedStream.emit("end");
  //   const mockFile = jest.fn().mockReturnValue({
  //     createWriteStream: jest.fn().mockReturnValue(mockedStream),
  //   });

  //   Storage.prototype.bucket = jest.fn().mockReturnValue({
  //     file: mockFile,
  //   });
  //   const sut = new GcpStorage();

  //   const buffer = Buffer.from(input.body);

  //   const inputBuffer = {
  //     ...input,
  //     body: buffer,
  //   };

  //   const readableBody = convertToStream(buffer);
  //   const gcpParams = {
  //     Bucket: inputBuffer.container,
  //     Key: inputBuffer.path,
  //     Body: readableBody,
  //     CacheControl: "no-cache",
  //     ContentType: "application/json",
  //     ContentLength: readableBody.readableLength,
  //   };

  //   await sut.write(inputBuffer);
  //   expect(Storage.Bucket.prototype.file).toHaveBeenCalledWith(
  //     gcpParams
  //   );
  // });

  // // it("use S3 putObject with Stream body", async () => {
  // //   const sut = new GcpStorage();
  // //   Storage.S3.prototype.putObject = jest.fn().mockReturnValue({
  // //     promise: jest.fn().mockResolvedValue({}),
  // //   });

  // //   const readableBody = new Readable();
  // //   readableBody.push(input.body);
  // //   readableBody.push(null);

  // //   const inputStream = {
  // //     ...input,
  // //     body: readableBody,
  // //   };

  // //   const expectedParams = {
  // //     ...inputStream.options,
  // //     Bucket: inputStream.container,
  // //     Key: inputStream.path,
  // //     Body: readableBody,
  // //     ContentLength: readableBody.readableLength,
  // //   };

  // //   await sut.write(inputStream);
  // //   expect(Storage.S3.prototype.putObject).toHaveBeenCalledWith(expectedParams);
  // // });

  // it("throw error when fail", async () => {
  //   const mockedStream = new PassThrough(); // <----
  //   //   mockedStream.on('data', (d) => {
  //   //     console.dir(d);
  //   // });

  //   // mockedStream.on("finish", function (d) {
  //   //   console.dir(d);
  //   // });
  //   // });
  //   // mockedStream.on("error", function (d) {
  //   //   console.log("EAAAAAAAAAAA");
  //   //   // throw(d);
  //   // });
  //   mockedStream.emit("finish", { generation: 123, etag: 123123 });

  //   // mockedStream.emit("error", new Error("fail"));
  //   mockedStream.end(); //   <-- end. not close.
  //   mockedStream.destroy();

  //   const mockFile = jest.fn().mockReturnValue({
  //     createWriteStream: jest.fn().mockReturnValue(mockedStream),
  //   });

  //   Storage.prototype.bucket = jest.fn().mockReturnValue({
  //     file: mockFile,
  //   });
  //   const sut = new GcpStorage();
  //   await expect(sut.write(input)).rejects.toThrow("fail");
  // });

  // it("return data on success", async () => {
  //   const response = {
  //     VersionId: "1.0",
  //     ETag: "foo",
  //   };

  //   Storage.prototype.putObject = jest.fn().mockReturnValue({
  //     promise: jest.fn().mockResolvedValue(response),
  //   });

  //   const sut = new GcpStorage();
  //   const expected = {
  //     version: response.VersionId,
  //     eTag: response.ETag,
  //   };

  //   expect(await sut.write(input)).toEqual(expected);
  // });
});
