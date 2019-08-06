import { CloudMessage, Middleware } from "@multicloud/sls-core";
import { AzureContext } from "..";
import { createReadStream } from "streamifier";


/**
 * Normalizes an Azure Storage Blob message into an array of records
 */
export const StorageBlobMiddleware = (): Middleware => async (context: AzureContext, next: () => Promise<void>) => {
  if (context instanceof AzureContext) {
    const bindingData = context.runtime.context.bindingData;
    const buffer = context.event;

    const message: CloudMessage = {
      id: bindingData.blobTrigger,
      contentType: bindingData.properties.contentType,
      length: bindingData.properties.length,
      body: createReadStream(buffer),
      timestamp: new Date(bindingData.properties.lastModified),
      properties: bindingData.properties,
      eventSource: "azure:storageBlob",
    };

    context.event = {
      records: [message]
    };
  }

  await next();
}
