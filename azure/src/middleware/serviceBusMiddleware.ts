import { Middleware, CloudMessage } from "@multicloud/sls-core";
import { AzureContext } from "../azureContext";

export const ServiceBusMiddleware = (): Middleware => async (context: AzureContext, next: () => Promise<void>) => {
  if (context instanceof AzureContext) {
    const bindingData = context.runtime.context.bindingData;

    const message: CloudMessage = {
      id: bindingData.messageId,
      body: context.event,
      timestamp: new Date(bindingData.enqueuedTimeUtc),
      properties: bindingData.properties,
      eventSource: "azure:serviceBus",
    };

    context.event = {
      records: [message]
    };
  }

  await next();
}
