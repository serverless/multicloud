import "reflect-metadata";
import { inject, injectable } from "inversify";
import { CloudRequest, ComponentType, StringParams } from "core/lib";
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
   * Initialize new Gcp Request, injecting Cloud Context
   * @param context Current CloudContext
   */
  public constructor(@inject(ComponentType.CloudContext) context: GcpContext) {
    const req = context.runtime.event;


    this.body = req.body ? JSON.parse(req.body) : null;
    this.headers = new StringParams(req.headers);
    this.method = req.method || "";
    this.query = new StringParams(req.query);
    this.pathParams = new StringParams(req.params);
  }
}
