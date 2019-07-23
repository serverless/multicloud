import { CloudContext, CloudRequest, CloudResponse, ComponentType } from "..";

/**
 * Middleware for HTTP bindings. Returns async function that accepts the
 * CloudContext and the `next` Function in the middleware chain
 */
export const HTTPBindingMiddleware = () => async (
  context: CloudContext,
  next: Function
): Promise<void> => {
  context.req = context.container.resolve<CloudRequest>(ComponentType.CloudRequest);
  context.res = context.container.resolve<CloudResponse>(ComponentType.CloudResponse);
  await next();
};
