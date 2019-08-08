import "reflect-metadata";
import { CloudRequest, ComponentType, StringParams } from "@multicloud/sls-core";
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
  public headers?: StringParams;
  /** HTTP method of request */
  public method: string;
  /** Query params of HTTP request */
  public query?: StringParams;
  /** Path params of HTTP Request */
  public pathParams?: StringParams;

  /**
   * Initialize new AWS Request, injecting cloud context
   * @param context Current CloudContext
   */
  public constructor(@inject(ComponentType.CloudContext) context: AwsContext) {
    const body = typeof (context.runtime.event.body) === "string"
      ? JSON.parse(context.runtime.event.body)
      : context.runtime.event.body;

    this.method = context.runtime.event.httpMethod;
    this.body = body || null;
    this.headers = new StringParams(context.runtime.event.headers);
    this.query = new StringParams(context.runtime.event.queryStringParameters);
    this.pathParams = new StringParams(context.runtime.event.pathParameters);
  }
}
