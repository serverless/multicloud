import "reflect-metadata";
import { inject, injectable } from "inversify";
import { CloudRequest, ComponentType } from "@multicloud/sls-core";
import { AzureContext } from "./azureContext";

@injectable()
export class AzureRequest implements CloudRequest {
  public body?: any;
  public headers?: { [key: string]: any };
  public method: string;
  public query?: { [key: string]: any };

  public constructor(
    @inject(ComponentType.CloudContext) private context: AzureContext
  ) {
    this.body = this.context.runtime.req.body || {};
    this.headers = this.context.runtime.req.headers || {};
    this.method = this.context.runtime.req.method || "";
    this.query = this.context.runtime.req.query || {};
  }
}
