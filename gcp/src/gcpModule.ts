import { ContainerModule, interfaces } from "inversify";
import { CloudModule, CloudContext, CloudRequest, CloudResponse, ComponentType, CloudService, CloudStorage } from "@multicloud/sls-core";

//gcp context , request, response and storage
import { GcpContext, GcpRequest, GcpResponse } from ".";


/**
 * GCP Module that can be registered in IoC container
 */
export class GcpModule implements CloudModule {
  /**
   * Determines whether or not the incoming request is an Gcp request
   * @param req The IoC resolution request
   */
  private isGcpRequest(req: interfaces.Request) {
    const runtimeArgs = req.parentContext.container.get(
      ComponentType.RuntimeArgs
    );
    return runtimeArgs && runtimeArgs[1].eventId; //TBD gcpRequestId name
  }

  public create() {
    return new ContainerModule((bind) => {
      bind<CloudContext>(ComponentType.CloudContext)
        .to(GcpContext)
        .inSingletonScope()
        .when(this.isGcpRequest);

      bind<CloudRequest>(ComponentType.CloudRequest)
        .to(GcpRequest)
        .when(this.isGcpRequest);

      bind<CloudResponse>(ComponentType.CloudResponse)
        .to(GcpResponse)
        .when(this.isGcpRequest);

      // TODO add cloud service

      //TODO add cloud storage
    });
  }
}
