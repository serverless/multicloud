import { CloudResponse } from "@multicloud/sls-core";
import { AWSContext } from "./awsContext";

export class AWSResponse implements CloudResponse {
  public headers?: { [key: string]: any };

  public constructor(context: AWSContext) {
    this.headers = {};
  }

  public send(body: any, status: number = 200, callback: Function): void {
    callback(null, {
      headers: this.headers,
      body: body,
      status: status
    });
  }
}
