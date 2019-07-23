import {
  Aborter,
  BlobURL,
  ServiceURL,
  StorageURL,
  SharedKeyCredential,
  ContainerURL
} from "@azure/storage-blob";
import { CloudStorage, ReadBlobOptions } from "@multicloud/sls-core";

/**
 * Implementation of CloudStorage for Azure Blob Storage
 */
export class AzureBlobStorage implements CloudStorage {

  private service: ServiceURL;

  /**
   * Initialize new Azure Blob Storage service
   * @param options Object containing `account` and `accountKey` for Azure Storage account
   */
  public constructor(options: any) {
    const sharedKeyCredential = new SharedKeyCredential(
      options.account,
      options.accountKey
    );
    const pipeline = StorageURL.newPipeline(sharedKeyCredential);

    this.service = new ServiceURL(
      `https://${options.account}.blob.core.windows.net`,
      pipeline
    );
  }

  /**
   * Read a blob from Azure Storage account
   * @param opts Specifies container and blob for read
   */
  public async read(opts: ReadBlobOptions) {
    const containerURL = ContainerURL.fromServiceURL(this.service, opts.container);
    const blobURL = BlobURL.fromContainerURL(containerURL, opts.path);

    const stream = await blobURL.download(Aborter.none, 0)
    return stream.readableStreamBody
  }
}
