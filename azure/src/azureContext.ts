import { AzureRequest } from "./azureRequest";
import { AzureResponse } from "./azureResponse";
import { CloudContext } from "core/src/cloudContext";
import { CloudRequest } from "core/src/cloudRequest";
import { CloudResponse } from "core/src/cloudResponse";
import CloudStorage from "core/src/cloudStorage";

export class AzureContext implements CloudContext {
  public providerType: string;
  public req: CloudRequest
  public res: CloudResponse;
  public storage: CloudStorage;
  public constructor(context: any) {
    this.providerType = "azure";
    this.req = new AzureRequest(context);
    this.res = new AzureResponse(context);
  }
}
