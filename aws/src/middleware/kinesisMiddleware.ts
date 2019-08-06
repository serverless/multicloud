import { CloudMessage, Middleware } from "@multicloud/sls-core";
import { AwsContext } from "..";

/**
 * Normalizes SQS messages into a generic records array
 */
export const KinesisMiddleware = (): Middleware => async (context: AwsContext, next: () => Promise<void>) => {
  if (context instanceof AwsContext) {
    const records: CloudMessage[] = context.runtime.event.Records.map((message) => ({
      id: message.eventID,
      body: message.kinesis.data,
      sequenceNumber: message.kinesis.sequenceNumber,
      partitionKey: message.kinesis.partitionKey,
      timestamp: new Date(message.kinesis.approximateArrivalTimestamp),
      eventSource: "aws:kinesis",
      eventSourceARN: message.kinesis.eventSourceARN
    }));

    context.event = { records };
  }

  await next();
};
