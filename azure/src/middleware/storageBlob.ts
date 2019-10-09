import { CloudMessage, Middleware } from "@multicloud/sls-core";
import { AzureContext } from "..";
import { createReadStream } from "streamifier";


/**
 * Normalizes an Azure Storage Blob message into an array of records
 */
export const StorageBlobMiddleware = (): Middleware => async (context: AzureContext, next: () => Promise<void>) => {
  if (context instanceof AzureContext) {
    const { blobTrigger, properties } = context.runtime.context.bindingData;
    const buffer = context.event;
    const timeDiff = new Date(properties.lastModified).getTime() - new Date(properties.created).getTime();
    const eventName = timeDiff === 0 ? "ObjectCreated:Put" : "";

    const message: CloudMessage = {
      id: blobTrigger,
      contentType: properties.contentType,
      length: properties.length,
      body: createReadStream(buffer),
      timestamp: new Date(properties.lastModified),
      properties,
      eventSource: "azure:storageBlob",
      eventName
    };

    context.event = {
      records: [message]
    };
  }

  await next();
}
