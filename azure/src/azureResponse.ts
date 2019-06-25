import { CloudResponse } from "core/src/cloudResponse";

export class AzureResponse implements CloudResponse {
  public headers?: { [key: string]: any };
  public context: any;

  public constructor(context: any) {
    this.headers = context.res.headers || {};
    this.context = context;
  }

  public send(body: any, status: number = 200): Promise<void> {
    return new Promise(() => {
      const { context } = this;

      context.res = {
        status: status,
        body: {
          message: body
        },
        headers: {
          "Content-Type": "application/json"
        }
      };

      context.done();
    });
  }
}
