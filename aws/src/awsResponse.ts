import "reflect-metadata";
import { CloudResponse, ComponentType } from "@multicloud/sls-core";
import { AwsContext } from ".";
import { injectable, inject } from "inversify";

@injectable()
export class AwsResponse implements CloudResponse {
  public headers?: { [key: string]: any };

  public constructor(@inject(ComponentType.CloudContext) context: AwsContext) {
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
