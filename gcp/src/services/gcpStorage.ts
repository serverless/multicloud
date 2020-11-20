import { Storage } from "@google-cloud/storage";
import {
  CloudStorage,
  ReadBlobOptions,
  WriteBlobOptions,
  convertToStream,
  Guard,
  WriteBlobOutput,
} from "@multicloud/sls-core";
import { Stream } from "stream";
import { injectable } from "inversify";
import "reflect-metadata";

/**
 * Implementation of CloudStorage for AWS S3 Storage
 */
@injectable()
export class GcpStorage implements CloudStorage {
  private storage: Storage;

  /**
   * Initialize new AWS S3 service
   */
  public constructor() {
    this.storage = new Storage();
  }

  /**
   * Read a file from an bucket
   * @param opts Container (bucket) and blob (object) to read from in the bucket
   */
  public async read(opts: ReadBlobOptions): Promise<Stream> {
    const params = {
      bucketName: opts.container,
      prefix: opts.path,
    };
    const bucket = await this.storage.bucket(params.bucketName);
    const file = await bucket.file(params.prefix);

    return file.createReadStream() as Stream;
  }

  /**
   * Write an object to a bucket
   * @param opts Container (bucket), blob (object) and body to write to google bucket
   */
  public async write(opts: WriteBlobOptions): Promise<WriteBlobOutput> {
    Guard.empty(opts.container, "container");
    Guard.empty(opts.path, "path");
    Guard.null(opts.body, "body");

    const bucket = this.storage.bucket(opts.container);
    console.log("BUCKET", bucket);
    console.log(opts);
    const file = bucket.file(opts.path);
    let response;
    console.log("FILE", file);
    const stream = await convertToStream(opts.body);
    console.log("STREAMMM",stream)
    stream
      .pipe(file.createWriteStream({resumable: false}))
      .on("error", function (err) {})
      .on("finish", function (res) {
        response = {
          version: res.generation,
          eTag: res.etag,
        };
        // The file upload is complete.
      });

    return response;
  }
}
