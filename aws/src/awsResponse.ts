import "reflect-metadata";
import { CloudResponse, ComponentType } from "@multicloud/sls-core";
import { AwsContext } from ".";
import { injectable, inject } from "inversify";

/**
 * Implementation of Cloud Response for AWS Lambda
 */
@injectable()
export class AwsResponse implements CloudResponse {

  private callback: Function;

  /** Headers of HTTP Response */
  public headers?: { [key: string]: any };

  /**
   * Initialize new AWS Response, injecting Cloud Context
   * @param context Current CloudContext
   */
  public constructor(@inject(ComponentType.CloudContext) context: AwsContext) {
    this.headers = {};
    this.callback = context.runtime.callback;
  }

  /**
   * Send HTTP response via provided callback
   * @param body Body of HTTP response
   * @param status Status code of HTTP response
   * @param callback Callback function to call with response
   */
  public send(body: any, status: number = 200): void {
    this.callback(null, {
      headers: this.headers,
      body: body,
      status: status
    });
  }
}
