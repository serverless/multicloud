import "reflect-metadata";
import { inject, injectable } from "inversify";
import { CloudResponse, ComponentType } from "@multicloud/sls-core";
import { AzureContext } from "./azureContext";

/**
 * Implementation of Cloud Response for Azure Functions
 */
@injectable()
export class AzureResponse implements CloudResponse {

  /** Headers of HTTP response */
  public headers?: { [key: string]: any };
  /** Original runtime from Azure Function context */
  public runtime: any;

  /**
   * Initialize new Azure Response, injecting Cloud Context
   * @param context Current CloudContext
   */
  public constructor(
    @inject(ComponentType.CloudContext) context: AzureContext
  ) {
    this.runtime = context.runtime;
    this.headers = context.runtime.res.headers || {};
  }

  /**
   * Send HTTP response
   * @param body Body of HTTP response
   * @param status Status code of HTTP response
   */
  public send(body: any, status: number = 200): void {
    this.runtime.res = {
      status: status,
      body: body,
      headers: this.headers,
    };
  }
}
