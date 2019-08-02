import { CloudContext, ComponentType } from "..";
import { CloudService } from "../services";
import { Middleware } from "../app";

/**
 * Middleware for Service binding. Returns async function that accepts the
 * CloudContext and the `next` Function in the middleware chain
 */
export const ServiceMiddleware = (): Middleware => async (context: CloudContext, next: Function): Promise<void> => {
  context.service = context.container.resolve<CloudService>(ComponentType.CloudService);
  await next();
};
