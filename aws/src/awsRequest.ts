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
    this.body = context.params.event.body || null;
    this.headers = context.params.event.headers || {};
    this.method = context.params.event.httpMethod;
    this.query = context.params.event.queryStringParameters || {};
    this.pathParams = context.params.event.pathParameters || {};
  }
}
