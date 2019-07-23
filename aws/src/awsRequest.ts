import "reflect-metadata";
import { CloudRequest, ComponentType } from "@multicloud/sls-core";
import { AwsContext } from ".";
import { injectable, inject } from "inversify";

/**
 * Implementation of Cloud Request for AWS Lambda
 */
@injectable()
export class AwsRequest implements CloudRequest {
  /** Body of HTTP Request */
  public body?: any;
  /** Headers of HTTP Request */
  public headers?: { [key: string]: any };
  /** HTTP method of request */
  public method: string;
  /** Query params of HTTP request */
  public query?: { [key: string]: any };
  /** Path params of HTTP Request */
  public pathParams?: { [key: string]: any };

  /**
   * Initialize new AWS Request, injecting cloud context
   * @param context Current CloudContext
   */
  public constructor(@inject(ComponentType.CloudContext) context: AwsContext) {
    let body = context.runtime.event.body ? (typeof context.runtime.event.body != "object" ? JSON.parse(context.runtime.event.body) : context.runtime.event.body) : null;
    this.body = body || null;
    this.headers = context.runtime.event.headers || {};
    this.method = context.runtime.event.httpMethod;
    this.query = context.runtime.event.queryStringParameters || {};
    this.pathParams = context.runtime.event.pathParameters || {};
  }
}
