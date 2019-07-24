import "reflect-metadata";
import { CloudResponse, ComponentType } from "@multicloud/sls-core";
import { AwsContext } from ".";
import { injectable, inject } from "inversify";

/**
 * Implementation of Cloud Response for AWS Lambda
 */
@injectable()
export class AwsResponse implements CloudResponse {
  /** The AWS runtime callback */
  private callback: Function;

  /** The HTTP response body */
  public body: any;

  /** The HTTP response status code */
  public status: number = 200;

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
    if (typeof (body) !== "string") {
      body = JSON.stringify(body);
    }

    this.body = body;
    this.status = status;
  }

  public flush(): void {
    this.callback(null, {
      headers: this.headers,
      body: this.body,
      statusCode: this.status || 200,
    });
  }
}
