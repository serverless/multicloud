import { CloudContext, CloudStorage, ComponentType } from "..";

/**
 * Middleware for adding the storage service to the context object.
 * It will allow to read, upload and delete files in the cloud.
 */
export const StorageMiddleware = () => async (
  context: CloudContext,
  next: Function
): Promise<void> => {
  context.storage = context.container.resolve<CloudStorage>(ComponentType.CloudStorage);
  await next();
};
