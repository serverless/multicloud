import { AzureRequest } from "./azureRequest";
import { AzureResponse } from "./azureResponse";
import { CloudContext } from "core/src/cloudContext";
import CloudStorage from "core/src/cloudStorage";

export class AzureContext implements CloudContext {
  private context: any;

  public constructor(context: any) {
    this.context = context;
    this.providerType = "azure";
    this.req = new AzureRequest(context);
    this.res = new AzureResponse(context);
  }

  public providerType: string;
  public req: AzureRequest;
  public res: AzureResponse;
  public storage: CloudStorage;


  public send(body: any, status: number = 200): void {
    if (this.res) {
      this.res.send(body, status);
    }
    this.context.done();
  }
}
