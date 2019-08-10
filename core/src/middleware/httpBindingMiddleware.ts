import { CloudContext, CloudRequest, CloudResponse, ComponentType } from "..";
import { Middleware } from "../app";

/**
 * Middleware for HTTP bindings. Returns async function that accepts the
 * CloudContext and the `next` Function in the middleware chain
 */
export const HTTPBindingMiddleware = (): Middleware =>
  async (context: CloudContext, next: () => Promise<void>): Promise<void> => {
    context.req = context.container.resolve<CloudRequest>(ComponentType.CloudRequest);
    context.res = context.container.resolve<CloudResponse>(ComponentType.CloudResponse);
    await next();
  };
