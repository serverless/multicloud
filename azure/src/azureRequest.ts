import "reflect-metadata";
import { inject, injectable } from "inversify";
import { CloudRequest, ComponentType } from "@multicloud/sls-core";
import { AzureContext } from "./azureContext";

/**
 * Implementation of Cloud Request for Azure Functions
 */
@injectable()
export class AzureRequest implements CloudRequest {
  /** Body of HTTP request */
  public body?: any;
  /** Headers of HTTP request */
  public headers?: { [key: string]: any };
  /** HTTP method of request */
  public method: string;
  /** Query params of HTTP request */
  public query?: { [key: string]: any };
  /** Path params of HTTP request */
  public pathParams?: { [key: string]: any };

  /**
   * Initialize new Azure Request, injecting Cloud Context
   * @param context Current CloudContext
   */
  public constructor(@inject(ComponentType.CloudContext) context: AzureContext) {
    const req = context.runtime.event || context.runtime.context.req;

    this.body = req.body || {};
    this.headers = req.headers || {};
    this.method = req.method || "";
    this.query = req.query || {};
    this.pathParams = req.params || {};
  }
}
