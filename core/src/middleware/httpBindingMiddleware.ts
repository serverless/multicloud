import { CloudContext, CloudRequest, CloudResponse, ComponentType } from "..";

export const HTTPBindingMiddleware = () => async (
  context: CloudContext,
  next: Function
): Promise<void> => {
  context.req = context.container.resolve<CloudRequest>(ComponentType.CloudRequest);
  context.res = context.container.resolve<CloudResponse>(ComponentType.CloudResponse);
  await next();
};
