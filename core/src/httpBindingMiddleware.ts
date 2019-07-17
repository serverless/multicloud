import { CloudContext } from "./cloudContext";
import { CloudRequest } from "./cloudRequest";
import { CloudResponse } from "./cloudResponse";
import { ContainerResolver, ComponentType } from "./cloudContainer";

export const HTTPBindingMiddleware = (container: ContainerResolver) => async (
  context: CloudContext,
  next: Function
): Promise<void> => {
  if(context.runtime && context.runtime.req && context.runtime.res){
    context.req = container.resolve<CloudRequest>(ComponentType.CloudRequest);
    context.res = container.resolve<CloudResponse>(ComponentType.CloudResponse);
  }
  await next();
};
