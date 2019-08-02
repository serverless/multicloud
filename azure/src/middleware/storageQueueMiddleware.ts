import { CloudMessage, Middleware } from "@multicloud/sls-core";
import { AzureContext } from "..";

/**
 * Normalizes an Azure Storage Queue message into an array of records
 */
export const StorageQueueMiddleware = (): Middleware => async (context: AzureContext, next: () => Promise<void>) => {
  if (context instanceof AzureContext) {
    const bindingData = context.runtime.context.bindingData;

    const message: CloudMessage = {
      id: bindingData.id,
      body: context.event,
      timestamp: new Date(bindingData.insertionTime),
      eventSource: "azure:storageQueue",
    };

    context.event = {
      records: [message]
    };
  }

  await next();
}
