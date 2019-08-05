import { Middleware, CloudMessage } from "@multicloud/sls-core";
import { AzureContext } from "../azureContext";

export const EventHubMiddleware = (): Middleware => async (context: AzureContext, next: () => Promise<void>) => {
  if (context instanceof AzureContext) {
    const bindingData = context.runtime.context.bindingData;

    const message: CloudMessage = {
      id: bindingData.sequenceNumber,
      partitionKey: bindingData.partitionKey,
      offset: bindingData.offset,
      body: context.event,
      timestamp: new Date(bindingData.enqueuedTimeUtc),
      eventSource: "azure:eventHub",
      properties: bindingData.properties,
    };

    context.event = {
      records: [message]
    };
  }

  await next();
}
