import { CloudMessage, Middleware, CloudContext, ConsoleLogger } from "@multicloud/sls-core";
import { Stream } from "stream";

/**
 * Normalizes S3 messages into a generic records array
 */
export const SimpleStorageMiddleware = (): Middleware => async (context: CloudContext, next: () => Promise<void>) => {
  if (context.providerType === "aws") {
    const logger = context.logger || new ConsoleLogger();

    if (!context.storage) {
      logger.error("Storage API missing from CloudContext. Ensure the CloudStorage middleware has been registered before the SimpleStorageMiddleware");
    }

    const tasks: Promise<CloudMessage>[] = context.runtime.event.Records.map(async (message) => {
      let stream: Stream;

      try {
        stream = await context.storage.read({
          container: message.s3.bucket.name,
          path: message.s3.object.key,
        });
      } catch (e) {
        logger.warn(`Error reading object, container: ${message.s3.bucket.name}, path: ${message.s3.object.key}`);
        logger.error(e);
        stream = null;
      }

      const cloudMessage = {
        id: `${message.s3.bucket.name}/${message.s3.object.key}`,
        body: stream,
        timestamp: new Date(message.eventTime),
        eventName: message.eventName,
        eventSource: "aws:s3",
      }

      return cloudMessage;
    });

    const records = await Promise.all(tasks);
    context.event = { records };
  }

  await next();
};
