import {
  Aborter,
  BlobURL,
  ServiceURL,
  StorageURL,
  SharedKeyCredential,
  ContainerURL
} from "@azure/storage-blob";
import { CloudStorage, ReadBlobOptions } from "@multicloud/sls-core";

export class AzureBlobStorage implements CloudStorage {
  private service: ServiceURL;

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

  public async read(opts: ReadBlobOptions) {
    const containerURL = ContainerURL.fromServiceURL(this.service, opts.container);
    const blobURL = BlobURL.fromContainerURL(containerURL, opts.path);

    const stream = await blobURL.download(Aborter.none, 0)
    return stream.readableStreamBody
  }
}
