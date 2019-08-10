import { CloudContext, ComponentType, CloudService, Middleware } from "..";

/**
 * Middleware for Service binding. Returns async function that accepts the
 * CloudContext and the `next` Function in the middleware chain
 */
export const ServiceMiddleware = (): Middleware =>
  async (context: CloudContext, next: () => Promise<void>): Promise<void> => {
    context.service = context.container.resolve<CloudService>(ComponentType.CloudService);
    await next();
  };
