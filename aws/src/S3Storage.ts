import AWS from "aws-sdk";
import CloudStorage, { ReadBlobOptions } from "core/src/cloudStorage";
import { Stream } from "stream";

export class S3Storage implements CloudStorage {
  private s3: AWS.S3;
  public constructor() {
    this.s3 = new AWS.S3();
  }

  public async read(opts: ReadBlobOptions): Promise<Stream> {
    const params = {
      Bucket: opts.container,
      Key: opts.path
    };
    const result = await this.s3.getObject(params).promise()
    return result.Body as Stream
  }
}
