import "reflect-metadata";
import { CloudResponse, ComponentType } from "@multicloud/sls-core";
import { AwsContext } from ".";
import { injectable, inject } from "inversify";

@injectable()
export class AwsResponse implements CloudResponse {
  private callback: Function;
  public headers?: { [key: string]: any };

  public constructor(@inject(ComponentType.CloudContext) context: AwsContext) {
    this.headers = {};
    this.callback = context.runtime.callback;
  }

  public send(body: any, status: number = 200): void {
    this.callback(null, {
      headers: this.headers,
      body: body,
      status: status
    });
  }
}
