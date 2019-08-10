import { CloudContext, CloudStorage, ComponentType, Middleware } from "..";

/**
 * Middleware for adding the storage service to the context object.
 * It will allow to read, upload and delete files in the cloud.
 */
export const StorageMiddleware = (): Middleware =>
  async (context: CloudContext, next: () => Promise<void>): Promise<void> => {
    context.storage = context.container.resolve<CloudStorage>(ComponentType.CloudStorage);
    await next();
  };
