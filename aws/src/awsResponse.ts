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

  /** Property to accept binary objects in the response */
  public isBase64Encoded: boolean;

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
   * @param contentType ContentType to apply it to response
   */
  public send(body: any, status: number = 200, contentType?: string): void {
    const responseBody = typeof (body) !== "string"
      ? JSON.stringify(body)
      : body;

    this.body = responseBody;
    this.status = status;

    if (!body) {
      return;
    }

    const bodyType = body.constructor.name;

    if (["Buffer"].includes(bodyType)) {
      this.isBase64Encoded = true;
      this.body = (body as Buffer).toString("base64");
      this.headers.set("Content-Type", contentType);
    }

    if (["Object", "Array"].includes(bodyType)) {
      this.headers.set("Content-Type", "application/json");
    }

    if (["String"].includes(bodyType)) {
      this.headers.set("Content-Type", "text/html");
    }
  }

  public flush(): void {
    this.callback(null, {
      isBase64Encoded: this.isBase64Encoded,
      headers: this.headers.toJSON(),
      body: this.body,
      statusCode: this.status || 200
    });
  }
}
