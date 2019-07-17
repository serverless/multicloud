import "reflect-metadata";
import { AzureRequest } from "./azureRequest";
import { AzureResponse } from "./azureResponse";
import { CloudContext, ComponentType } from "@multicloud/sls-core";
import { CloudStorage } from "@multicloud/sls-core";
import { injectable, inject } from "inversify";

@injectable()
export class AzureContext implements CloudContext {
  public runtime: any;

  public constructor(@inject(ComponentType.RuntimeArgs) private args: any[]) {
    this.runtime = args[0];
    this.providerType = "azure";
  }

  public providerType: string;
  public req: AzureRequest;
  public res: AzureResponse;
  public storage: CloudStorage;

  public send(body: any, status: number = 200): void {
    if (this.res) {
      this.res.send(body, status);
    }
    this.runtime.done();
  }
}
