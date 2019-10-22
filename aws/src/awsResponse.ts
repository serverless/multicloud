import "reflect-metadata";
import {
  CloudResponse,
  ComponentType,
  ProviderType,
  CloudProviderResponseHeader,
  StringParams,
  CloudResponseLike
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
    this.headers.set("Content-Type", "application/json");
    this.headers.set(CloudProviderResponseHeader, ProviderType.AWS);
    this.callback = context.runtime.callback;
  }

  /**
   * Send HTTP response via provided callback
   * @param body Body of HTTP response
   * @param status Status code of HTTP response
   * @param contentType ContentType to apply it to response
   */
  public send(response: CloudResponseLike = {}): void {
    this.status = response.status || 200;
    response.headers = response.headers || {};

    if (response.body) {
      const responseBody = typeof (response.body) !== "string"
        ? JSON.stringify(response.body)
        : response.body;

      this.body = responseBody;
      const bodyType = response.body.constructor.name;

      if (["Buffer"].includes(bodyType)) {
        this.isBase64Encoded = true;
        this.body = (response.body as Buffer).toString("base64");
      }

      if (["String"].includes(bodyType)) {
        response.headers["Content-Type"] = "text/html";
      }
    }

    Object.keys(response.headers).forEach((key) => {
      this.headers.set(key, response.headers[key]);
    });
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
