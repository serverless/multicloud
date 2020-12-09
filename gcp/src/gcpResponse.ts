import "reflect-metadata";
import {
  CloudResponse,
  ComponentType,
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
  private runtime: any;

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
    this.runtime = context.runtime;
  }

  /**
   * Stringify the body
   * @param body Body of HTTP request
   */
  private stringifyJson(body: any) {
    if(typeof(body) === "string") return body;
    if(!body) return null;
    let stringifyBody = null;
    try{
      stringifyBody = JSON.stringify(body);
    } catch (e) {
      throw {
        status: 400,
        error: "Format not supported. The supported response types are JSON and text."
      }
    }
    return stringifyBody;
  }

  /**
   * Send HTTP response via provided callback
   * @param body Body of HTTP response
   * @param status Status code of HTTP response
   */
  public send(body: any = null, status: number = 200): void {
    const responseBody = this.stringifyJson(body);

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
    this.runtime.flush(this);
  }
}
