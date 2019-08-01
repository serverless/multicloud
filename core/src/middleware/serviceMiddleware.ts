import { CloudContext, ComponentType } from "..";
import { CloudService } from "../services";

/**
 * Middleware for Service binding. Returns async function that accepts the
 * CloudContext and the `next` Function in the middleware chain
 */
export const ServiceMiddleware = () => async (
  context: CloudContext,
  next: Function
): Promise<void> => {
  context.service = context.container.resolve<CloudService>(ComponentType.CloudService);
  await next();
};
