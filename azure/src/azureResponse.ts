import { CloudResponse } from "@multicloud/sls-core";

export class AzureResponse implements CloudResponse {
  public headers?: { [key: string]: any };
  public context: any;

  public constructor(context: any) {
    this.headers = context.res.headers || {};
    this.context = context;
  }

  public send(body: any, status: number = 200): void {
    this.context.res = {
      status: status,
      body: {
        message: body
      },
      headers: {
        "Content-Type": "application/json"
      }
    };
  }
}
