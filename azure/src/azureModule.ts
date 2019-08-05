import { ContainerModule, interfaces } from "inversify";
import { CloudModule, CloudContext, CloudRequest, CloudResponse, ComponentType, CloudService, CloudStorage } from "@multicloud/sls-core";
import { AzureContext, AzureRequest, AzureResponse, AzureBlobStorage } from ".";
import { AzureFunctionCloudService } from "./services";

/**
 * Azure Module that can be registered in IoC container
 */
export class AzureModule implements CloudModule {

  /**
   * Determines whether or not the incoming request is an Azure request
   * @param req The IoC resolution request
   */
  private isAzureRequest(req: interfaces.Request) {
    const runtimeArgs = req.parentContext.container.get(ComponentType.RuntimeArgs);
    return runtimeArgs && runtimeArgs[0].invocationId;
  };

  /**
   * Creates the inversify container module
   */
  public create() {
    return new ContainerModule((bind) => {
      bind<CloudContext>(ComponentType.CloudContext)
        .to(AzureContext)
        .when(this.isAzureRequest);

      bind<CloudRequest>(ComponentType.CloudRequest)
        .to(AzureRequest)
        .when(this.isAzureRequest);

      bind<CloudResponse>(ComponentType.CloudResponse)
        .to(AzureResponse)
        .when(this.isAzureRequest);

      bind<CloudService>(ComponentType.CloudService)
        .to(AzureFunctionCloudService)
        .when(this.isAzureRequest);

      bind<CloudStorage>(ComponentType.CloudStorage)
        .to(AzureBlobStorage)
        .when(this.isAzureRequest);
    });
  }
}
