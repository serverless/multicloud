import "reflect-metadata";
import {
  CloudResponse,
  ComponentType,
  ProviderType,
  CloudProviderResponseHeader,
  StringParams
} from "@multicloud/sls-core";
import { GcpContext } from ".";
import { injectable, inject } from "inversify";

/**
 * Implementation of Cloud Response for GCP Cloud Function
 */
@injectable()
export class GcpResponse implements CloudResponse {
  /** The GCP runtime callback */
  private callback: Function;

  /** The HTTP response body */
  public body: any;

  /** The HTTP response status code */
  public status: number = 200;

  /** Headers of HTTP Response */
  public headers?: StringParams = new StringParams();

  /**
   * Initialize new GCP Response, injecting Cloud Context
   * @param context Current CloudContext
   */
  public constructor(@inject(ComponentType.CloudContext) context: GcpContext) {
    this.headers.set(CloudProviderResponseHeader, "gcp");
    this.callback = context.runtime.callback;
  }

  /**
   * Send HTTP response via provided callback
   * @param body Body of HTTP response
   * @param status Status code of HTTP response
   * @param callback Callback function to call with response
   */
  public send(body: any = null, status: number = 200): void {
    const responseBody = typeof (body) !== "string"
      ? body != null ? JSON.stringify(body) : null
      : body;

    this.body = responseBody;
    this.status = status;

    if (!body) {
      return;
    }

    const bodyType = body.constructor.name;

    if (["Object", "Array"].includes(bodyType)) {
      this.headers.set("Content-Type", "application/json");
    }

    if (["String"].includes(bodyType)) {
      this.headers.set("Content-Type", "text/html");
    }
  }

  public flush(): void {
    this.callback(null, {
      headers: this.headers.toJSON(),
      body: this.body,
      statusCode: this.status,
    });
  }
}
