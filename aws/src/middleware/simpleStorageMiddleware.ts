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

      const bucketName = message.s3.bucket.name;
      const objectKey = decodeURIComponent(message.s3.object.key.replace(/\+/g, "%20"));

      try {
        stream = await context.storage.read({
          container: bucketName,
          path: objectKey,
        });
      } catch (e) {
        logger.warn(`Error reading object, container: ${bucketName}, path: ${objectKey}`);
        logger.error(e);
        stream = null;
      }

      const cloudMessage = {
        id: `${bucketName}/${objectKey}`,
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
