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
  public constructor(
    @inject(ComponentType.CloudContext) private context: AzureContext
  ) {
    this.body = this.context.runtime.req.body || {};
    this.headers = this.context.runtime.req.headers || {};
    this.method = this.context.runtime.req.method || "";
    this.query = this.context.runtime.req.query || {};
    this.pathParams = this.context.runtime.req.params || {};
  }
}
