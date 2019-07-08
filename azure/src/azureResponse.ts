import "reflect-metadata";
import { inject, injectable } from "inversify";
import { CloudResponse, ComponentType } from "@multicloud/sls-core";
import { AzureContext } from "./azureContext";

@injectable()
export class AzureResponse implements CloudResponse {
  public headers?: { [key: string]: any };
  public runtime: any;

  public constructor(
    @inject(ComponentType.CloudContext) context: AzureContext
  ) {
    this.runtime = context.runtime;
    this.headers = context.runtime.res.headers || {};
  }

  public send(body: any, status: number = 200): void {
    this.runtime.res = {
      status: status,
      body: {
        message: body
      },
      headers: {
        "Content-Type": "application/json"
      }
    };
  }
}
