import {
  Aborter,
  BlobURL,
  ServiceURL,
  StorageURL,
  SharedKeyCredential,
  ContainerURL
} from "@azure/storage-blob";
import { CloudStorage, ReadBlobOptions } from "@multicloud/sls-core";
import { injectable } from "inversify";
import { Stream } from "stream";
import "reflect-metadata";

/**
 * Implementation of CloudStorage for Azure Blob Storage
 */
@injectable()
export class AzureBlobStorage implements CloudStorage {

  private service: ServiceURL;

  /**
   * Initialize new Azure Blob Storage service
   */
  public constructor() {
    const sharedKeyCredential = new SharedKeyCredential(
      process.env.azAccount,
      process.env.azAccountKey
    );
    const pipeline = StorageURL.newPipeline(sharedKeyCredential);

    this.service = new ServiceURL(
      `https://${process.env.azAccount}.blob.core.windows.net`,
      pipeline
    );
  }

  /**
   * Read a blob from Azure Storage account
   * @param opts Specifies container and blob for read
   */
  public async read(opts: ReadBlobOptions): Promise<Stream> {
    const containerURL = ContainerURL.fromServiceURL(this.service, opts.container);
    const blobURL = BlobURL.fromContainerURL(containerURL, opts.path);

    const stream = await blobURL.download(Aborter.none, 0)
    return stream.readableStreamBody
  }
}
