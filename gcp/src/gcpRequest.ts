import "reflect-metadata";
import { inject, injectable } from "inversify";
import { CloudRequest, ComponentType, StringParams } from "@multicloud/sls-core";
import { GcpContext } from "./gcpContext";

/**
 * Implementation of Cloud Request for Gcp Functions
 */
@injectable()
export class GcpRequest implements CloudRequest {
  /** Body of HTTP request */
  public body?: any;
  /** Headers of HTTP request */
  public headers?: StringParams;
  /** HTTP method of request */
  public method: string;
  /** Query params of HTTP request */
  public query?: StringParams;
  /** Path params of HTTP request */
  public pathParams?: StringParams;

  /**
   * Parse the body
   * @param body Body of HTTP request
   */
  private parseJson(body: any) {
    let parsedBody;
    try{
      parsedBody = JSON.parse(body);
    } catch (e) {
      parsedBody = null;
    }
    return parsedBody;
  }

  /**
   * Initialize new Gcp Request, injecting Cloud Context
   * @param context Current CloudContext
   */
  public constructor(@inject(ComponentType.CloudContext) context: GcpContext) {
    const req = context.runtime.event;
    const body = this.parseJson(req.body);

    this.body = body;
    this.headers = new StringParams(req.headers);
    this.method = req.method || "";
    this.query = new StringParams(req.query);
    this.pathParams = new StringParams(req.params);
  }
}

