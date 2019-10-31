import "reflect-metadata";
import { injectable } from "inversify";
import { CloudContext } from "./cloudContext";
import { CloudResponseLike, CloudResponse } from "./cloudResponse";

@injectable()
export abstract class CloudContextBase implements CloudContext {
  [key: string]: any;
  public providerType: string;
  public id: string;
  public event: any;
  public res?: CloudResponse;

  /**
   * Sends the specified response to the client and completes the request
   * @param response The response to return to the client
   */
  public send(response?: CloudResponseLike): void;

  /**
   * Sends the specified response to the client and completes the request
   * @param body The response body (defaults to null)
   * @param status The response status code (defaults to 200)
   * @param contentType  The response headers
   */
  public send(body?: any, status?: number, contentType?: string): void

  public send(bodyOrResponse: any, status?: number, contentType?: string): void {
    if (this.res) {
      let response: CloudResponseLike;
      if (arguments.length === 1) {
        response = {
          body: bodyOrResponse.body || bodyOrResponse || null,
          status: bodyOrResponse.status && typeof (bodyOrResponse.status) === "number" ? bodyOrResponse.status : 200,
          headers: bodyOrResponse.headers || {}
        }
      } else {
        response = {
          body: bodyOrResponse || null,
          status: status || 200,
          headers: {}
        }
      }

      if (contentType) {
        response.headers["Content-Type"] = contentType;
      }

      this.res.send(response);
    }

    this.done();
  }

  public abstract done(): void;

  /**
   * Flushes the Cloud Context and completes the response
   */
  public flush() {
    if (this.res) {
      this.res.flush();
    }
  }
}
