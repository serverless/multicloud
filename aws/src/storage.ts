import AWS from "aws-sdk";
import CloudStorage, { ReadBlobOptions } from "core/src/cloudStorage";
import { Stream } from "stream";

export class Storage implements CloudStorage {
  private s3: AWS.S3;
  public constructor(options: any) {
    AWS.config.loadFromPath(options);
    this.s3 = new AWS.S3();
  }

  public read(opts: ReadBlobOptions): Promise<Stream> {
    const params = {
      Bucket: opts.container,
      Key: opts.path
    };
    return this.s3
      .getObject(params)
      .promise()
      .then(x => x.Body as Stream);
  }
}
