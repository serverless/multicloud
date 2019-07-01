import { CloudRequest } from "@multicloud/sls-core";
import { AWSContext } from "./awsContext";

export class AWSRequest implements CloudRequest {
  public body?: any;
  public headers?: { [key: string]: any };
  public method: string;
  public query?: { [key: string]: any };

  public constructor(context: AWSContext) {
    this.body = context.params.event.body || null;
    this.headers = context.params.event.headers || {};
    this.method = context.params.event.httpMethod;
    this.query = context.params.event.queryStringParameters || {};
  }
}
