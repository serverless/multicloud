import "reflect-metadata";
import { CloudRequest, ComponentType } from "@multicloud/sls-core";
import { AwsContext } from ".";
import { injectable, inject } from "inversify";

@injectable()
export class AwsRequest implements CloudRequest {
  public body?: any;
  public headers?: { [key: string]: any };
  public method: string;
  public query?: { [key: string]: any };
  public pathParams?: { [key: string]: any };

  public constructor(@inject(ComponentType.CloudContext) context: AwsContext) {
    this.body = context.runtime.event.body || null;
    this.headers = context.runtime.event.headers || {};
    this.method = context.runtime.event.httpMethod;
    this.query = context.runtime.event.queryStringParameters || {};
    this.pathParams = context.runtime.event.pathParameters || {};
  }
}
