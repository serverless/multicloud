import "reflect-metadata";
import {
  CloudResponse,
  ComponentType,
  ProviderType,
  CloudProviderResponseHeader,
  StringParams
} from "@multicloud/sls-core";
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
  public headers?: StringParams = new StringParams();

  /**
   * Initialize new AWS Response, injecting Cloud Context
   * @param context Current CloudContext
   */
  public constructor(@inject(ComponentType.CloudContext) context: AwsContext) {
    this.headers.set(CloudProviderResponseHeader, ProviderType.AWS);
    this.callback = context.runtime.callback;
  }

  /**
   * Send HTTP response via provided callback
   * @param body Body of HTTP response
   * @param status Status code of HTTP response
   * @param callback Callback function to call with response
   */
  public send(body: any, status: number = 200): void {
    const responseBody = typeof (body) !== "string"
      ? JSON.stringify(body)
      : body;

    this.body = responseBody;
    this.status = status;

    if (!body) {
      return;
    }

    if (body.constructor.name === "Object") {
      this.headers.set("Content-Type", "application/json");
    }

    if (typeof (body) === "string") {
      this.headers.set("Content-Type", "text/html");
    }
  }

  public flush(): void {
    this.callback(null, {
      headers: this.headers,
      body: this.body,
      statusCode: this.status || 200,
    });
  }
}
