import { Middleware } from "../app";
import { CloudContext } from "../cloudContext";
import { CloudRequest } from "../cloudRequest";
import { ComponentType } from "../cloudContainer";
import { CloudResponse } from "../cloudResponse";

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
