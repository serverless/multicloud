import AWS from "aws-sdk";
import { CloudStorage, ReadBlobOptions } from "@multicloud/sls-core";
import { Stream } from "stream";
import { injectable } from "inversify";
import "reflect-metadata";

/**
 * Implementation of CloudStorage for AWS S3 Storage
 */
@injectable()
export class S3Storage implements CloudStorage {

  private s3: AWS.S3;

  /**
   * Initialize new AWS S3 service
   */
  public constructor() {
    this.s3 = new AWS.S3();
  }

  /**
   * Read an object from an S3 bucket
   * @param opts Container (bucket) and blob (object) to read from in S3
   */
  public async read(opts: ReadBlobOptions): Promise<Stream> {
    const params = {
      Bucket: opts.container,
      Key: opts.path
    };
    const result = await this.s3.getObject(params).promise()
    return result.Body as Stream
  }
}
