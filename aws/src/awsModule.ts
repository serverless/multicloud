import { CloudModule, CloudContext, CloudRequest, CloudResponse, ComponentType } from "@multicloud/sls-core";
import { ContainerModule, interfaces } from "inversify";
import { AwsContext, AwsRequest, AwsResponse } from ".";

/**
 * AWS Module that can be registered in IoC container
 */
export class AwsModule implements CloudModule {

  /**
   * Determines whether or not the incoming request is an AWS request
   * @param req The IoC resolution request
   */
  private isAwsRequest(req: interfaces.Request) {
    const runtimeArgs = req.parentContext.container.get(ComponentType.RuntimeArgs);
    return runtimeArgs && runtimeArgs[1].awsRequestId;
  };

  /**
   * Creates the inversify container module
   */
  public create() {
    return new ContainerModule((bind) => {
      bind<CloudContext>(ComponentType.CloudContext)
        .to(AwsContext)
        .when(this.isAwsRequest);

      bind<CloudRequest>(ComponentType.CloudRequest)
        .to(AwsRequest)
        .when(this.isAwsRequest);

      bind<CloudResponse>(ComponentType.CloudResponse)
        .to(AwsResponse)
        .when(this.isAwsRequest);
    });
  }
}
