import {
  CloudModule,
  CloudContext,
  CloudRequest,
  CloudResponse,
  ComponentType
} from "@multicloud/sls-core";
import { Container } from "inversify";
import { AzureContext } from "./azureContext";
import { AzureRequest } from "./azureRequest";
import { AzureResponse } from "./azureResponse";

export class AzureModule implements CloudModule {
  public init(container: Container) {
    container
      .bind<CloudContext>(ComponentType.CloudContext)
      .to(AzureContext)
      .inSingletonScope();

    container
      .bind<CloudRequest>(ComponentType.CloudRequest)
      .to(AzureRequest)
      .inSingletonScope();

    container
      .bind<CloudResponse>(ComponentType.CloudResponse)
      .to(AzureResponse)
      .inSingletonScope();
  }
}
