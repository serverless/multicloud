import { CloudRequest } from "core/src/cloudRequest";

export class AzureRequest implements CloudRequest {
  public body?: any;
  public headers?: { [key: string]: any };
  public method: string;
  public query?: { [key: string]: any };

  public constructor(context: any) {
    this.body = context.req.body || {};
    this.headers = context.req.headers || {};
    this.method = context.req.method || {};
    this.query = context.req.query || {};
  }
}
