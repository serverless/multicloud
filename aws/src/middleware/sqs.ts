import { CloudMessage, Middleware } from "@multicloud/sls-core";
import { AwsContext } from "..";

/**
 * Normalizes SQS messages into a generic records array
 */
export const SimpleQueueMiddleware = (): Middleware => async (context: AwsContext, next: () => Promise<void>) => {
  if (context instanceof AwsContext) {
    const records: CloudMessage[] = context.runtime.event.Records.map((message) => ({
      id: message.messageId,
      body: message.body,
      timestamp: new Date(message.attributes.SentTimestamp),
      eventSource: "aws:sqs",
    }));

    context.event = { records };
  }

  await next();
};
