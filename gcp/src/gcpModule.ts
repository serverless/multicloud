import { ContainerModule, interfaces } from "inversify";
import {
  CloudModule,
  CloudContext,
  CloudStorage,
  CloudRequest,
  CloudResponse,
  ComponentType,
  CloudService,
} from "@multicloud/sls-core";
//gcp context , request, response and storage
import { GcpContext, GcpRequest, GcpResponse } from ".";
import { GcpFunctionCloudService, GcpStorage } from "./services";

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

    const isBackgroundFunction = runtimeArgs && runtimeArgs[1].eventId;
    const isHttpFunction = runtimeArgs && runtimeArgs[0]._readableState && runtimeArgs[0]._readableState.highWaterMark;

    return  isBackgroundFunction || isHttpFunction;
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

      bind<CloudService>(ComponentType.CloudService)
        .to(GcpFunctionCloudService)
        .when(this.isGcpRequest);

      bind<CloudStorage>(ComponentType.CloudStorage)
        .to(GcpStorage)
        .when(this.isGcpRequest);
    });
  }
}
